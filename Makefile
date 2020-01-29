# ----------------------------
#       CONFIGURATION
# ----------------------------

# Import deploy config
dpl ?= deploy.env
include $(dpl)
export $(shell sed 's/=.*//' $(dpl))

# Set gitlab-ci variables if not in a CI context
ifndef CI_REGISTRY_IMAGE
	CI_REGISTRY_IMAGE := $(DOCKER_REGISTRY)/misakey/frontend
endif
DOCKER_IMAGE := $(CI_REGISTRY_IMAGE)
ifndef CI_COMMIT_REF_NAME
	CI_COMMIT_REF_NAME := $(shell git rev-parse --abbrev-ref HEAD)
endif

REV := $(shell git rev-parse --short HEAD)
RELEASE := "$(CI_COMMIT_REF_NAME)"
SENTRY_ENV := "production-env"

# remove `/` & `SERVICE_TAG_METADATA` from commit ref name
ifneq (,$(findstring /,$(CI_COMMIT_REF_NAME)))
	CI_COMMIT_REF_NAME := $(shell echo $(CI_COMMIT_REF_NAME) |  sed -n "s/^.*\/\(.*\)$$/\1/p")
	RELEASE := "$(CI_COMMIT_REF_NAME)"
	SENTRY_ENV := "local-env"
endif

ifneq (,$(findstring master,$(CI_COMMIT_REF_NAME)))
	RELEASE := "$(CI_COMMIT_REF_NAME)-$(REV)"
	SENTRY_ENV := "preprod-env"
endif


# Set default goal (`make` without command)
.DEFAULT_GOAL := help

# ----------------------------
#          COMMANDS
# ----------------------------

.PHONY: echo
echo:
	@echo "CI_COMMIT_REF_NAME=$(CI_COMMIT_REF_NAME)"
	@echo "RELEASE=$(RELEASE)"

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
	@docker build --build-arg VERSION=$(RELEASE) --build-arg SENTRY_ENV=$(SENTRY_ENV) --build-arg SENTRY_AUTH_TOKEN=$(SENTRY_AUTH_TOKEN) -t $(DOCKER_IMAGE):$(CI_COMMIT_REF_NAME) .

PLUGIN_ENV ?= production
.PHONY: build-plugin
build-plugin: ## Generate zip folder for misakey webextension
	@docker build -f plugin/docker/Dockerfile -t plugin --build-arg plugin_env=${PLUGIN_ENV} --build-arg plugin_version=${VERSION} .
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
	@mkdir -p ./build_plugin/$(PLUGIN_ENV)/${TARGET_BROWSER}
	docker-compose -f $(CURRENT_DIR)/docker-compose.plugin.yml up --build

.PHONY: clean-plugin
clean-plugin:  ## Stop and remove dev container for plugin-dev
	docker-compose -f $(CURRENT_DIR)/docker-compose.plugin.yml stop
	docker-compose -f $(CURRENT_DIR)/docker-compose.plugin.yml rm

.PHONY: deploy
deploy: ## Push image to the docker registry
	@docker push $(DOCKER_IMAGE):$(CI_COMMIT_REF_NAME)

.PHONY: build-package
.ONESHELL:
build-package:
ifeq ($(PACKAGE),)
	@echo "Should set a PACKAGE var"
else
	@cd src/packages/$(PACKAGE)
	@yarn install
	@yarn build
endif


.PHONY: deploy-package
.ONESHELL:
deploy-package: build-package npm-login ## Deploy package to NPM registry
ifneq ($(PACKAGE),)
	@cd src/packages/$(PACKAGE)
	@sh ../../../scripts/publish_package.sh
endif

.PHONY: npm-login
npm-login: ## Log in to the default registry
ifneq ($(PACKAGE),)
	@cd src/packages/$(PACKAGE)
endif
ifneq ($(NPM_TOKEN),)
	@echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
endif


.PHONY: clean
clean: ## Remove all images related to the project
	@docker images | grep $(DOCKER_IMAGE) | tr -s ' ' | cut -d ' ' -f 2 | xargs -I {} docker rmi $(CI_REGISTRY_IMAGE):{}
