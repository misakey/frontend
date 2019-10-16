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
ENV NO_ZIP true

RUN yarn install
RUN yarn --cwd plugin install
RUN yarn build-plugin

RUN yarn global add serve

CMD ["serve"] 
