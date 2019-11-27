FROM node:10.15.3

COPY ./src /app/src
COPY ./public /app/public
COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./config-overrides.js /app/config-overrides.js
COPY ./yarn.lock /app/yarn.lock

COPY ./plugin/src /app/plugin/src
COPY ./plugin/popup /app/plugin/popup
COPY ./plugin/config /app/plugin/config
COPY ./plugin/package.json /app/plugin/package.json
COPY ./plugin/webpack.config.js /app/plugin/webpack.config.js
COPY ./plugin/yarn.lock /app/plugin/yarn.lock

WORKDIR /app

ENV INLINE_RUNTIME_CHUNK false
ARG plugin_env=production
ARG plugin_version

RUN yarn install
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
