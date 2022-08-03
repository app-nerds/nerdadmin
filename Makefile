.DEFAULT_GOAL := help
.PHONY: help setup

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

VERSION := $(shell cat ./VERSION)

setup: ## Sets up dependencies
	yarn global add rollup uglify-js uglifycss

build: clean build-nerdadmin ## Builds Nerd Admin for distribution

build-debug: clean rollup ## Builds a non-minified version of Nerd Admin

clean: ## Removes all files from the dist folder
	@rm -rf dist/*

build-nerdadmin: rollup
	uglifyjs dist/nerdadmin.js -c -m -o dist/nerdadmin.min.js --comments '/v\d.\d.\d/' --source-map
	uglifycss --output dist/nerdadmin.min.css src/nerdadmin.css
	rm dist/nerdadmin.js

rollup:
	rollup src/nerdadmin.js --name dist/nerdadmin.js --format es -o dist/nerdadmin.js --banner "/* Copyright © 2022 App Nerds LLC $(VERSION) */"

