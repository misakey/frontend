# ----------------------------
#       CONFIGURATION
# ----------------------------

# Import deploy config
dpl ?= deploy.env
include $(dpl)
export $(shell sed 's/=.*//' $(dpl))

# This version-strategy uses git tags to set the version string
VERSION := $(shell git describe --tags --always --dirty)

# Set gitlab-ci variables if not in a CI context
ifndef CI_REGISTRY_IMAGE
	CI_REGISTRY_IMAGE := $(DOCKER_REGISTRY)/misakey/$(APP_NAME)
endif
ifndef CI_COMMIT_REF_NAME
	CI_COMMIT_REF_NAME := $(shell git rev-parse --abbrev-ref HEAD)
endif
CI_COMMIT_REF_NAME := $(shell if echo "$(CI_COMMIT_REF_NAME)" | grep -q "/"; then echo $(CI_COMMIT_REF_NAME) |  sed -n "s/^.*\/\(.*\)$$/\1/p"; else echo $(CI_COMMIT_REF_NAME); fi)

# Set default goal (`make` without command)
.DEFAULT_GOAL := help

# ----------------------------
#          COMMANDS
# ----------------------------

.PHONY: echo
echo:
	@echo "$(CI_COMMIT_REF_NAME)"

.PHONY: help
help:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: dep
dep: ## Install all dependencies in the node_modules folder
	@yarn install && yarn --cwd plugin install

.PHONY: docs
docs: ## Validate documentation
	@echo "No documentation in frontend project. Doc is in js-common project"

.PHONY: deploy-docs
deploy-docs: ## Deploy documentation. USE ONLY ON PRODUCTION!
	@echo "No documentation in frontend project. Doc is in js-common project"

.PHONY: test
test: ## Unit test code
	@yarn test --passWithNoTests

.PHONY: lint
lint: strict-lint ## Lint project code with eslint

.PHONY: strict-lint
strict-lint: ## Lint project code with eslint, return error if there is any suggestion
	@yarn lint

.PHONY: docker-login
docker-login: ## Log in to the default registry
	@docker login -u $(CI_REGISTRY_USER) -p $(CI_REGISTRY_PASSWORD) $(DOCKER_REGISTRY)

.PHONY: build
build: ## Build a docker image with the build folder and serve server
	@echo $(VERSION) >> public/version.txt
	@docker build -t $(CI_REGISTRY_IMAGE):$(VERSION) .

.PHONY: build-plugin
build-plugin: ## Generate zip folder for misakey webextension
	@docker build -f plugin/docker/Dockerfile -t plugin .
	@docker run -d --name plugin plugin
	@mkdir -p ./build_plugin
	# Copy files in /build_plugin
	@docker cp plugin:/app/artifacts/. ./build_plugin
	# Stop plugin container
	@docker stop plugin
	# Remove plugin container
	@docker rm plugin

.PHONY: zip-plugin-source-code
zip-plugin-source-code: ## Generate a clean zip of the source code for firefox review
	@zip build_plugin/source_code.zip -r -FS src/* public/* plugin/* Makefile .eslintrc config-overrides.js jsconfig.json LICENSE package.json README.md yarn.lock -x '*plugin/build/*' '*plugin/node_modules/*' '*plugin/docker/*'

CURRENT_DIR := $(shell pwd)
.PHONY: start-plugin
start-plugin:  ## Generate development environment for plugin
	@mkdir -p ./build_plugin_dev/
	docker-compose -f $(CURRENT_DIR)/docker-compose.plugin.yml up --build

.PHONY: clean-plugin
clean-plugin:  ## Stop and remove dev container for plugin-dev
	docker-compose -f $(CURRENT_DIR)/docker-compose.plugin.yml stop
	docker-compose -f $(CURRENT_DIR)/docker-compose.plugin.yml rm

.PHONY: tag
tag: ## Tag a docker image and set some aliases
ifeq ($(CI_COMMIT_REF_NAME),master)
	@docker tag $(CI_REGISTRY_IMAGE):$(VERSION) $(CI_REGISTRY_IMAGE):latest
endif
ifeq ($(CI_COMMIT_REF_NAME),release)
	@docker tag $(CI_REGISTRY_IMAGE):$(VERSION) $(CI_REGISTRY_IMAGE):rc
endif
	@docker tag $(CI_REGISTRY_IMAGE):$(VERSION) $(CI_REGISTRY_IMAGE):$(CI_COMMIT_REF_NAME)

.PHONY: deploy
deploy: ## Push image to the docker registry
	@docker push $(CI_REGISTRY_IMAGE):$(VERSION)
ifeq ($(CI_COMMIT_REF_NAME),master)
	@docker push $(CI_REGISTRY_IMAGE):latest
endif
ifeq ($(CI_COMMIT_REF_NAME),release)
	@docker push $(CI_REGISTRY_IMAGE):rc
endif
	@docker push $(CI_REGISTRY_IMAGE):$(CI_COMMIT_REF_NAME)

.PHONY: clean
clean: ## Remove all images related to the project
	@docker images | grep $(CI_REGISTRY_IMAGE) | tr -s ' ' | cut -d ' ' -f 2 | xargs -I {} docker rmi $(CI_REGISTRY_IMAGE):{}
