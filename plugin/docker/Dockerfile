FROM node:10.15.3

COPY ./src /app/src
# COPY only what we need for plugin from public
COPY ./public/favicon.ico /app/public/favicon.ico
COPY ./public/locales /app/public/locales
COPY ./public/libs /app/public/libs
COPY ./public/img /app/public/img
COPY ./public/ico /app/public/ico
COPY ./public/index.html /app/public/index.html
COPY ./public/initMatomo.js /app/public/initMatomo.js

COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./config-overrides.js /app/config-overrides.js
COPY ./yarn.lock /app/yarn.lock

COPY ./plugin/src /app/plugin/src
COPY ./plugin/config /app/plugin/config
COPY ./plugin/package.json /app/plugin/package.json
COPY ./plugin/webpack.config.js /app/plugin/webpack.config.js
COPY ./plugin/yarn.lock /app/plugin/yarn.lock

WORKDIR /app

ENV INLINE_RUNTIME_CHUNK false
ARG plugin_env=production
ARG plugin_version

RUN yarn install --network-timeout 100000
RUN yarn --cwd plugin install
RUN PLUGIN_ENV=${plugin_env} yarn build-plugin

RUN yarn global add serve

RUN yarn global add web-ext

RUN for D in `find build_plugin/${plugin_env}/* -maxdepth 0 -type d`; \
do browser=${D#build_plugin/${plugin_env}/}; \
web-ext build --source-dir=$D --overwrite-dest --artifacts-dir="artifacts/${browser}"; \
mv artifacts/${browser}/*.zip artifacts/misakey${plugin_version}_${plugin_env}_${browser}.zip; \
rm -rf artifacts/${browser}; \
done

CMD ["serve"] 
