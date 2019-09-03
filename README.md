# MKAdmin
Misakey for admin is a platform about Service claiming and management.

A Service is an entity associated to a domain's name that handles several
aspects of like requests, sso, users...

## Run the project
[With test-and-run](https://gitlab.com/Misakey/test-and-run?nav_source=navbar#run)

## Lint and test
```shell
yarn lint && yarn test
```

## Deployment

:warning: Make sure the corresponding images exist before running the following commands.

Create a `config.yaml` file with a `config:` key and the `env.js` production content (you can find an example in `/helm/config.sample.yaml`)

When you want to deploy the application for the first time, clone the repo, checkout to the desired tag, then run:

```
helm install --name admin-frontend helm/admin-frontend -f path/to/config.yaml --set env=production --set image.tag=`git describe --tags --always`

```

If you just need to upgrade the application, then run:
```
helm upgrade admin-frontend helm/admin-frontend -f path/to/config.yaml --set env=production --set image.tag=`git describe --tags --always`
```
