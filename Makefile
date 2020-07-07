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

# remove `/` & `SERVICE_TAG_METADATA` from commit ref name
ifneq (,$(findstring /,$(CI_COMMIT_REF_NAME)))
	CI_COMMIT_REF_NAME := $(shell echo $(CI_COMMIT_REF_NAME) |  sed -n "s/^.*\/\(.*\)$$/\1/p")
	RELEASE := "$(CI_COMMIT_REF_NAME)"
endif

ifneq (,$(findstring master,$(CI_COMMIT_REF_NAME)))
	RELEASE := "$(CI_COMMIT_REF_NAME)-$(REV)"
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
	@yarn install --network-timeout 100000

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

.PHONY: docs
docs: ## Validate documentation
	@yarn run styleguide:build

.PHONY: run-docs
run-docs: ## Run devserver of documentation
	@yarn run styleguide

.PHONY: build
build: ## Build a docker image with the build folder and serve server
	@docker build --build-arg VERSION="$(RELEASE)" --build-arg SENTRY_AUTH_TOKEN=$(SENTRY_AUTH_TOKEN) -t $(DOCKER_IMAGE):$(CI_COMMIT_REF_NAME) .

.PHONY: build-maintenance
build-maintenance:
	@docker build -f maintenance/Dockerfile -t $(DOCKER_IMAGE)/maintenance:$(CI_COMMIT_REF_NAME) maintenance

.PHONY: deploy-maintenance
deploy-maintenance:
	@docker push $(DOCKER_IMAGE)/maintenance:$(CI_COMMIT_REF_NAME)

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
	@yarn install --network-timeout 100000
	@yarn build
endif

.PHONY: build-base
.ONESHELL:
build-base:
	@docker build -f base-image.Dockerfile -t $(DOCKER_IMAGE)/base-image:latest .

.PHONY: deploy-base
.ONESHELL:
deploy-base:
	@docker push $(DOCKER_IMAGE)/base-image:latest

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
