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
PRETTIER_FILES := $(filter %.css %.json %.md %.mjs %.js %.njk,$(FILES))

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

.PHONY: dev
dev: ## Start the Vite dev server (HMR, /en /fr)
	npx vite

.PHONY: build
build: ## Build the production site to dist/
	npx vite build

.PHONY: preview
preview: ## Serve the built dist/ on http://localhost:3001
	npx vite preview --port 3001

.PHONY: serve-dist
serve-dist: ## Serve dist/ via http-server (no SPA fallback)
	npx http-server dist --port 3001

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
# Measure (15 KB transfer budget)
# =============================================================================

BUDGET_BYTES ?= 15360

.PHONY: measure
measure: ## Check that /en and /fr stay under the 15 KB total-transfer budget
	@BUDGET_BYTES=$(BUDGET_BYTES) node scripts/measure-budget.mjs

# =============================================================================
# Assets
# =============================================================================

.PHONY: favicons
favicons: ## Regenerate favicons from the source via scripts/favicons.mjs
	node scripts/favicons.mjs

.PHONY: avatar
avatar: ## Resize the source avatar into a 240×240 WebP + JPEG fallback
	node scripts/resize-avatar.mjs

# =============================================================================
# Deploy
# =============================================================================

.PHONY: env
env: ## Print the resolved env (sanity check before deploy)
	@echo "LFTP_LOGIN         = $${LFTP_LOGIN:-<unset>}"
	@echo "LFTP_FQDN          = $${LFTP_FQDN:-<unset>}"
	@echo "LFTP_PASSWORD      = $${LFTP_PASSWORD:+<set>}$${LFTP_PASSWORD:-<unset>}"
	@echo "IMAGE_VERSION      = $(IMAGE_VERSION)"
	@echo "DOCKER_CONFIG_PATH = $(DOCKER_CONFIG_PATH)"

.PHONY: deploy
deploy: ## Mirror dist/ to the SFTP host defined in .env (lftp)
	@if [ -z "$$LFTP_LOGIN" ] || [ -z "$$LFTP_FQDN" ] || [ -z "$$LFTP_PASSWORD" ]; then \
		echo "Missing LFTP_LOGIN / LFTP_FQDN / LFTP_PASSWORD — populate .env (see .env.example)"; \
		exit 1; \
	fi
	@test -d dist || { echo "dist/ missing — run 'make build' first"; exit 1; }
	lftp "sftp://$$LFTP_LOGIN@$$LFTP_FQDN" --env-password \
		-e "mirror -R -c -P=10 dist/ /pierreguilbert.com; bye"
