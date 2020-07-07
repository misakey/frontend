FROM node:10.15.3 AS builder
LABEL stage=intermediate

COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./config-overrides-application.js /app/config-overrides.js
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn install --network-timeout 100000
