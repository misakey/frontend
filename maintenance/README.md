# Maintenance mod

The app could be in a maintenance mode (for huge backend migration for example), so we want to
display a temporary frontend to let the users know what is happening.

This folder contains what we need to do that:
- the `index.html` is the maintenance mode frontend
- the `Dockerfile` is the way to build it (with `nginx.conf` required)

## How to enable / disable maintenance mode

You can simply enable / disable maintenance mode with a helm command:

**Enable :** `helm upgrade frontend helm/frontend --reuse-values --set maintenance=true`

**Disable :** `helm upgrade frontend helm/frontend --reuse-values --set maintenance=false`

