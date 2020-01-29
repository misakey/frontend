#!/bin/sh

if [ -z "$SENTRY_AUTH_TOKEN" ]
then 
  echo "NO SENTRY SECRET CONFIGURED, WONT CREATE RELEASE"
else
  yarn add -W @sentry/cli

  ./node_modules/@sentry/cli/bin/sentry-cli releases --project $SENTRY_ENV --org misakey new $VERSION
  ./node_modules/@sentry/cli/bin/sentry-cli releases --project $SENTRY_ENV --org misakey files $VERSION upload-sourcemaps /app/build/static/js --rewrite --validate --url-prefix '~/static/js'
fi
