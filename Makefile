
.PHONY: run, serve, build, deploy, env, .help

TAG := $(shell git describe --tags --abbrev=0)
DOCKER_CONFIG_PATH := $(shell pwd)
export IMAGE_VERSION := $(TAG)

include .env
export $(shell sed 's/=.*//' .env)


help:
	@echo "Targets:"
	@echo "	install: Install node dependencies"

env:
	@echo "LFTP_LOGIN = ${LFTP_LOGIN}"
	@echo "LFTP_FQDN = ${LFTP_FQDN}"
	@echo "LFTP_PASSWORD = ${LFTP_PASSWORD}"
	@echo "IMAGE_VERSION = ${IMAGE_VERSION}"
	@echo "DOCKER_CONFIG_PATH = ${DOCKER_CONFIG_PATH}"

serve:
	npx vite serve pierreguilbert --port 3000

run: serve

build:
	npx vite build pierreguilbert

serve-dist:
	npx http-server pierreguilbert/dist  --port 3001

deploy:
	lftp  "sftp://${LFTP_LOGIN}@${LFTP_FQDN}" --env-password -e "mirror -R -c -P=10 pierreguilbert/dist/ /pierreguilbert.com; bye"
