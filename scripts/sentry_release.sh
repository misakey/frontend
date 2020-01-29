#!/bin/sh

if [ -z "$SENTRY_AUTH_TOKEN" ]
then 
  echo "NO SENTRY SECRET CONFIGURED, WONT CREATE RELEASE"
else
  echo "Installing sentry CLI"
  yarn add -W @sentry/cli

  echo "Creating release frontend@$VERSION"
  ./node_modules/@sentry/cli/bin/sentry-cli releases --project frontend --org misakey new frontend@$VERSION
  
  echo "Pushing sourcemaps to release $VERSION"
  ./node_modules/@sentry/cli/bin/sentry-cli releases --project frontend --org misakey files frontend@$VERSION upload-sourcemaps /app/build/static/js --rewrite --validate --url-prefix '~/static/js'
fi
