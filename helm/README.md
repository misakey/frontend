# Deployment instructions

To deploy the project, we do use [Helm](https://helm.sh/). 

The Helm chart is in this folder. 

As all frontend configurations are public, we have decided to commit it here:
* `config.preprod.yaml`: this is the config file used for preproduction environment
* `config.prod.yaml`: this is the config file used for production environment

We have to make those files up-to-date with new changes in the app (if you update the `env.js` file
you should update those two files too)

**:warning: Make sure the corresponding images exist before running the following commands. :arrow_down:**

## First deployment

When you want to deploy the application for the first time, clone the repo, checkout to the desired tag, then run:

```shell
# For preproduction
helm install --name frontend helm/frontend -f helm/config.preprod.yaml --set env=production --set image.tag=master --set image.pullPolicy=Always

# For production
helm install --name frontend helm/frontend -f helm/config.prod.yaml --set env=production --set image.tag=`git describe --tags --always`
```

## Upgrading


If you just need to upgrade the application version, then run:

```shell
# For preproduction
helm upgrade frontend helm/frontend -f helm/config.preprod.yaml --set env=production --set image.tag=master  --set image.pullPolicy=Always

# For production
helm upgrade frontend helm/frontend -f helm/config.prod.yaml --set env=production --set image.tag=`git describe --tags --always`
```

:information_source: **Tip** on preprod env, if you don't have any modification to the config file,
you can only remove the pod `kubectl remove pods [POD ID]`. The pullPolicy will make it repull the 
latest version.