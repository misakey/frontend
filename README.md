Misakey frontend
================

[![License BSL](https://img.shields.io/static/v1?label=License&message=BSL&color=e32e72)](./LICENSE)
[![CI](https://img.shields.io/gitlab/pipeline/Misakey/frontend)](https://gitlab.com/Misakey/frontend/pipelines/)


This project is the frontend repository of [Misakey](https://misakey.com/). It contains the code of the webapp and the plugin.

For more info about Misakey, you can see our [presentation page](https://docs.misakey.com).

On this README you will only find technical information about the frontend code.
For more global information about Misakey, the contribution guide, the community, 
the licensing philosophy or a more global overview of the project, please go on the 
[README of the backend monorepo](https://gitlab.com/Misakey/misakey/).


## Overview 

This project contains the source code of the Misakey webapp and the Misakey web extension.
The source code for the webapp and the popup of the web extension are the same (so we will talk of
webapp for the plugin popup from now on)

The webapp is based on [CRA](https://github.com/facebook/create-react-app).

The webextension specific code (background and content scripts) is generated with webpack.

The extension use [mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill) as it is intended to work with Chrome, Firefox, Opera, Edge and Safari.

The rest of this readme will focus on the webapp. For plugin specific information go on the specific
[README](plugin/README.md).

## How to run it ?

### Dependencies

To make the project run, you'll need a working [NodeJS](https://nodejs.org/en/download/releases/) environment, we highly recommend LTS version or higher.

You'll probably need a [Docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/) environment.

We use [Yarn](https://yarnpkg.com/) as our package manager

### Webapp

You can create a development docker image with the `Dockerfile.dev`. It'll start a dev server
you can work on. 

You can create a production image with the command `make build`

## Folder architecture

* [/devtools](./devtools): contains some tools useful for the developers.
* [/helm](./helm): contains deployment material
* [/plugin](./plugin): contains plugin specific material (build, content & background script, ...)
* [/public](./public): contains the public part of the app (html files, static ressources, locales for XHR loading)
* [/scripts](./scripts): contains scripts used by the CI and other tools
* [/src](./src): contains the sources of the app

You'll find a specific README in every important folder.

## Documentation

We use [Styleguidist](https://github.com/styleguidist/react-styleguidist) for creating a component library documentation.

## Misc

### Configs

We use [React App Rewired](https://github.com/timarney/react-app-rewired) to be able to add some config over CRA.

The config for the webapp is `config-overrides-application.js`. It contains config to make the packages
usable in the app directly.

### I18N

Locale file organization:
- in `public/locales` we have one locale file per workspace (`account`, `admin`, `auth`, `citizen`, `dpo`, `plugin`).
Those translation files are loaded by XHR request. We did that to optimize the size of loaded locales.
- in `src/constants/locales` we have all common locales, they are loaded everywhere in the app.
    - `fields`: for all fields translations. It only contains translation used by Field component
    - `landing`: the landing translations. I didn't put it in XHR to limit XHR call in landing loading. The perf impact is minor (very few translation keys) but that reduce by one the number of XHR call on the landing page
    - `commons`: for transversal non component-specific translation (little words, HTTP error codes, inter-workspace infos)
    - `components`: For components specific translations (drawer, appbar, ...). Only for components that are not workspace specific

### Lint and test

```shell
# Lint
make lint 

# Tests
make test
```

### Git hook

A pre-commit hook is available to automatically run the linter before any commit
(this way we can avoid "lint" commits)

To install it go to the `devtools/git` folder and run `./pre-commit-install.sh`

### CI

We had some troubles with the GitlabCI (pipelines that take 30min, many crashes, ...).

Here some info we got to try to make it better:
- Adding policy to cache, to only push it in first stage and only pull it after
- Increase yarn timeout, because CI server can be overloaded, so with a reduced bandwidth

Other improvement possibilities for later:
- Using MinIO for having a shared cache ([blog article](https://www.enovate.co.uk/blog/2019/12/11/distributed-gitlab-runner-caching-with-minio))
- Followup this [Gitlab issue](https://gitlab.com/gitlab-org/gitlab-runner/issues/1151#note_284331761)
- Followup of [Gitlab workspaces for CI](https://gitlab.com/groups/gitlab-org/-/epics/1418)

## License

The code is published under AGPLv3. More info in the [LICENSE](LICENSE) file.

## Cryptography notice

This distribution and associated services include cryptographic software. 
The country in which you currently reside may have restrictions on the import, possession, use, 
and/or re-export to another country, of encryption software. BEFORE using any encryption software, 
please check your country's laws, regulations and policies concerning the import, possession, 
or use, and re-export of encryption software, to see if this is permitted. 
See http://www.wassenaar.org/ for more information.
