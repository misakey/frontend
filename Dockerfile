ARG BASE_IMAGE_VERSION=v6.2
FROM misakey/frontend-base-image:${BASE_IMAGE_VERSION} AS builder
LABEL stage=intermediate
ARG VERSION
ARG SENTRY_AUTH_TOKEN

COPY ./src /app/src
COPY ./public /app/public
COPY ./scripts /app/scripts
COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./config-overrides.js /app/config-overrides.js
COPY ./yarn.lock /app/yarn.lock
COPY ./.eslintrc /app/.eslintrc
COPY ./.eslintignore /app/.eslintignore

WORKDIR /app

RUN echo $VERSION >> public/version.txt
RUN sed -i "s/VERSION_TO_SET_ON_BUILD/$VERSION/g" /app/public/bundleVersion.js

# Disabling inline runtime chunk
# to avoid requiring "script-src 'unsafe-inline'" in CSPs
# (see https://gitlab.misakey.dev/misakey/user-needs/-/issues/294
# and https://create-react-app.dev/docs/advanced-configuration/
# and https://drag13.io/posts/react-inline-runtimer-chunk/index.html)
RUN INLINE_RUNTIME_CHUNK=false yarn run build --env=prod

RUN /app/scripts/sentry_release.sh


FROM nginx:1.16.0-alpine
COPY --from=builder /app/build /app/build
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
