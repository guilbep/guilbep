# pierreguilbert.com — top-level entry points.
# Run `make help` to see what's available.

.DEFAULT_GOAL := help

# Load .env so deploy/env targets work. Missing .env is non-fatal (`-include`).
-include .env
export

TAG                ?= $(shell git describe --tags --abbrev=0 2>/dev/null || echo "untagged")
IMAGE_VERSION      ?= $(TAG)
DOCKER_CONFIG_PATH := $(shell pwd)

# FILES can be overridden to target specific files (for git hooks / partial formats).
FILES ?= .
PRETTIER_FILES := $(filter %.css %.json %.md %.mjs %.js %.eta,$(FILES))

# =============================================================================
# Help
# =============================================================================

.PHONY: help
help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

# =============================================================================
# Lifecycle
# =============================================================================

.PHONY: install
install: ## Install npm dependencies
	npm install --ignore-scripts

.PHONY: clean
clean: ## Remove node_modules, dist, .tmp, and the lockfile
	rm -rf node_modules dist .tmp
	rm -f package-lock.json

# =============================================================================
# Develop
# =============================================================================

.PHONY: blog
blog: ## Convert src/blog/*.md → src/pages/blog*.eta via marked
	node scripts/build-blog.mjs

.PHONY: dev
dev: blog ## Start the Vite dev server (HMR, /en /fr)
	npx vite

.PHONY: build
build: blog ## Build the production site to dist/
	npx vite build
	@# Move /<locale>/blog.html into /<locale>/blog/index.html. The plugin
	@# always emits flat .html files; with a /blog/ directory containing
	@# posts, Apache mod_dir picks the directory first and 403s without an
	@# index. Putting the page inside the directory resolves cleanly.
	@for loc in en fr; do \
		if [ -f dist/$$loc/blog.html ] && [ -d dist/$$loc/blog ]; then \
			mv dist/$$loc/blog.html dist/$$loc/blog/index.html; \
			echo "  ✓ dist/$$loc/blog.html → dist/$$loc/blog/index.html"; \
		fi; \
	done
	@# Inject per-page CO2-per-visit footer based on gzipped size.
	@node scripts/inject-co2.mjs

.PHONY: preview
preview: ## Serve the built dist/ on http://localhost:3001
	npx vite preview --port 3001

.PHONY: serve-dist
serve-dist: ## Serve dist/ via http-server (no SPA fallback)
	npx http-server dist --port 3001 -b

# =============================================================================
# Quality
# =============================================================================

.PHONY: format
format: ## Format CSS/JSON/MD/JS/NJK with prettier
	@set -e; \
	if [ "$(FILES)" = "." ]; then \
		npx prettier --write . --ignore-unknown; \
	elif [ -n "$(PRETTIER_FILES)" ]; then \
		npx prettier --write $(PRETTIER_FILES) --ignore-unknown; \
	fi

.PHONY: lint
lint: ## Check formatting without writing
	@set -e; \
	if [ "$(FILES)" = "." ]; then \
		npx prettier --check . --ignore-unknown; \
	elif [ -n "$(PRETTIER_FILES)" ]; then \
		npx prettier --check $(PRETTIER_FILES) --ignore-unknown; \
	fi

# =============================================================================
# Measure (transfer budgets: 3 KB primary target, 14 KB hard ceiling)
# =============================================================================

# Primary target: fits in the TCP slow-start window with headroom for headers.
BUDGET_BYTES           ?= 3072
# Secondary (hard) ceiling: the classic 14 KB rule.
SECONDARY_BUDGET_BYTES ?= 14336

.PHONY: measure
measure: ## Check per-locale transfer against the 3 KB target / 14 KB ceiling
	@BUDGET_BYTES=$(BUDGET_BYTES) \
	 SECONDARY_BUDGET_BYTES=$(SECONDARY_BUDGET_BYTES) \
	 node scripts/measure-budget.mjs

# =============================================================================
# Assets
# =============================================================================

.PHONY: favicons
favicons: ## Regenerate favicons from the source via scripts/favicons.mjs
	node scripts/favicons.mjs

.PHONY: avatar
avatar: ## Resize the source avatar into a 200×200 WebP + JPEG fallback
	node scripts/resize-avatar.mjs

# =============================================================================
# Docker (gzip-enabled local serve via nginx)
# =============================================================================

DOCKER_IMAGE  ?= pierreguilbert-com
DOCKER_PORT   ?= 8080
DOCKER_NAME   ?= pierreguilbert-com-test

.PHONY: docker-build
docker-build: ## Build the local-serve Docker image (assumes dist/ exists)
	@test -d dist || { echo "dist/ missing — run 'make build' first"; exit 1; }
	docker build -t $(DOCKER_IMAGE) .

.PHONY: docker-serve
docker-serve: docker-build ## Serve dist/ on http://localhost:$(DOCKER_PORT) with nginx + gzip
	@docker rm -f $(DOCKER_NAME) >/dev/null 2>&1 || true
	docker run --rm -d --name $(DOCKER_NAME) -p $(DOCKER_PORT):8080 $(DOCKER_IMAGE)
	@echo "Serving on http://localhost:$(DOCKER_PORT)/  ('make docker-stop' to stop)"

.PHONY: docker-stop
docker-stop: ## Stop the local-serve container
	docker rm -f $(DOCKER_NAME) >/dev/null 2>&1 || true

.PHONY: docker-headers
docker-headers: ## Probe a running container for gzip + cache headers on key paths
	@for path in / /en/ /fr/ /assets/styles/$$(ls dist/assets/styles | head -1) sitemap-index.xml; do \
		echo ">> $$path"; \
		curl -sI -H 'Accept-Encoding: gzip' "http://localhost:$(DOCKER_PORT)$$path" | head -8; \
		echo; \
	done

# =============================================================================
# Deploy
# =============================================================================

.PHONY: env
env: ## Print the resolved env (sanity check before deploy) — never prints secret values
	@echo "LFTP_LOGIN         = $${LFTP_LOGIN:-<unset>}"
	@echo "LFTP_FQDN          = $${LFTP_FQDN:-<unset>}"
	@echo "LFTP_PASSWORD      = $$([ -n \"$$LFTP_PASSWORD\" ] && echo '<set>' || echo '<unset>')"
	@echo "IMAGE_VERSION      = $(IMAGE_VERSION)"
	@echo "DOCKER_CONFIG_PATH = $(DOCKER_CONFIG_PATH)"

.PHONY: deploy
deploy: ## Mirror dist/ to the SFTP host defined in .env (lftp).
	@if [ -z "$$LFTP_LOGIN" ] || [ -z "$$LFTP_FQDN" ] || [ -z "$$LFTP_PASSWORD" ]; then \
		echo "Missing LFTP_LOGIN / LFTP_FQDN / LFTP_PASSWORD — populate .env (see .env.example)"; \
		exit 1; \
	fi
	@test -d dist || { echo "dist/ missing — run 'make build' first"; exit 1; }
	@# Explicitly remove known-stale paths first (mirror doesn't delete by default).
	@# /<locale>/blog.html got promoted into /<locale>/blog/index.html on this
	@# build; leaving the flat file around would let Apache pick the wrong target.
	lftp "sftp://$$LFTP_LOGIN@$$LFTP_FQDN" --env-password \
		-e "rm -f /pierreguilbert.com/en/blog.html; rm -f /pierreguilbert.com/fr/blog.html; rm -f /pierreguilbert.com/en/site.webmanifest; rm -f /pierreguilbert.com/fr/site.webmanifest; rm -f /pierreguilbert.com/pierreguilbert.vcf; rm -f /pierreguilbert.com/PierreGuilbertCV_english.pdf; rm -f /pierreguilbert.com/PierreGuilbertCV_french.pdf; mirror -R -c -P=10 dist/ /pierreguilbert.com; bye"
