FROM node:14.16.1 AS builder
LABEL stage=intermediate

COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./config-overrides.js /app/config-overrides.js
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn install --network-timeout 100000
