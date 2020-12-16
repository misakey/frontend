Misakey frontend
================

[![License AGPLv3](https://img.shields.io/static/v1?label=License&message=AGPLv3&color=e32e72)](./LICENSE)

Misakey is the user account solution for people and applications who
value privacy and simplicity. And it’s open source.

This project is the frontend repository of [Misakey](https://misakey.com/).

You can find more info about Misakey in our [website](https://www.misakey.com) and our [about page](https://about.misakey.com/).

On this README you will only find technical information about the frontend code.
For more global information about Misakey, the contribution guide, the community, 
the licensing philosophy or a more global overview of the project, please go on the 
[README of the backend monorepo](https://gitlab.com/Misakey/backend/).


## Overview 

This project contains the source code of the Misakey webapp.

The webapp is based on [CRA](https://github.com/facebook/create-react-app).


## How to run it ?

### Dependencies

To make the project run, you'll need a working [NodeJS](https://nodejs.org/en/download/releases/) environment, we highly recommend LTS version or higher.

You'll probably need a [Docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/) environment.

We use [Yarn](https://yarnpkg.com/) as our package manager

### Webapp

You can create a development docker image with the `Dockerfile.dev`. It'll start a dev server
you can work on. 

You can create a production image with the command `make build`

### Dependencies management

To make the CI lighter and don't use too much ressources in our docker images, 
we're building a base image used by the CI and to build the production image of the app
that contains the npm dependencies of the app.

This mean that if you want to add some dependencies to the project you have to update this base image. 

#### Building a new image, with new dependencies

`VERSION=vX.Y make build-base` will build a new image base. Once you tested it locally([testing image locally](#testing-locally)) (with a `make build`),
you can publish it with a `VERSION=vX.Y make deploy-base`.

:warning: The base is published on DockerHub. Ask for a maintainer to have access to it if you want to update an image.

Aside from building the image (and deploying it) with a new version (incremented from latest image version), you should update the used version in two files:
- `.gitlab-ci.yml`: set the `BASE_IMAGE_VERSION` env var to your new version
- `Dockerfile`: set the `BASE_IMAGE_VERSION` env var to your new version

##### Testing locally

Once you built a new image base, run `make build` on frontend project to generate a local docker image.

At the end of `make build`, you should see something like: 
```
Successfully built [COMMIT_ID]
Successfully tagged registry.misakey.dev/misakey/frontend:[BUILD_TAG]
```

In `test&run`, in your `.env`, set `FRONTEND_TAG=[BUILD_TAG]`, then run `make application`.

App should then run as expected, but with a prod env config AND your new `frontend-base` build.

## Folder architecture

* [/devtools](./devtools): contains some tools useful for the developers.
* [/helm](./helm): contains deployment material
* [/public](./public): contains the public part of the app (html files, static resources, locales for XHR loading)
* [/scripts](./scripts): contains scripts used by the CI and other tools
* [/src](./src): contains the sources of the app

You'll find a specific README in every important folder.

## Documentation

We use [Styleguidist](https://github.com/styleguidist/react-styleguidist) for creating a component library documentation.

## Misc

### Configs

We use [React App Rewired](https://github.com/timarney/react-app-rewired) to be able to add some config over CRA.

The config for the webapp is `config-overrides.js`. It contains config to make the packages
usable in the app directly.

### I18N

Locale file organization:
- in `public/locales` we have one locale file per workspace (`account`, `boxes`).
Those translation files are loaded by XHR request. We did that to optimize the size of loaded locales.
- in `src/constants/locales` we have all common locales, they are loaded everywhere in the app.
    - `fields`: for all fields translations. It only contains translation used by Field component
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

## Source management disclaimer

Misakey uses GitLab for the development of its free softwares. Our Github repositories are only mirrors. If you want to work with us, fork us on gitlab.com (no registration needed, you can sign in with your Github account)

## Cryptography notice

This distribution and associated services include cryptographic software. 
The country in which you currently reside may have restrictions on the import, possession, use, 
and/or re-export to another country, of encryption software. BEFORE using any encryption software, 
please check your country's laws, regulations and policies concerning the import, possession, 
or use, and re-export of encryption software, to see if this is permitted. 
See http://www.wassenaar.org/ for more information.
