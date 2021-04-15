FROM node:14.16.1 AS builder
LABEL stage=intermediate

COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./config-overrides.js /app/config-overrides.js
COPY ./yarn.lock /app/yarn.lock
COPY ./src/packages/sdk/package.json /app/src/packages/sdk/package.json 

WORKDIR /app

RUN yarn install --network-timeout 100000

WORKDIR /app/src/packages/sdk
RUN yarn install --network-timeout 100000