FROM node:10.15.3

COPY ./src /app/src
COPY ./public /app/public
COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./config-overrides.js /app/config-overrides.js
COPY ./yarn.lock /app/yarn.lock

COPY ./plugin/src /app/plugin/src
COPY ./plugin/popup /app/plugin/popup
COPY ./plugin/package.json /app/plugin/package.json
COPY ./plugin/webpack.config.js /app/plugin/webpack.config.js
COPY ./plugin/yarn.lock /app/plugin/yarn.lock

WORKDIR /app

ENV INLINE_RUNTIME_CHUNK false

RUN yarn install
RUN yarn --cwd plugin install
RUN yarn build-plugin

RUN yarn global add serve

RUN yarn global add web-ext

RUN for D in `find build_plugin/* -maxdepth 0 -type d`; \
do browser=${D#build_plugin/} ; web-ext build --source-dir=$D --overwrite-dest --artifacts-dir="artifacts/${browser}"; \
mv artifacts/${browser}/*.zip artifacts/misakey_${browser}.zip; \
done

CMD ["serve"] 
