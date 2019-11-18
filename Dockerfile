FROM node:10.15.3 AS builder
LABEL stage=intermediate
ARG VERSION

COPY ./src /app/src
COPY ./public /app/public
COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app

RUN echo $VERSION >> public/version.txt
RUN sed -i "s/VERSION_TO_SET_ON_BUILD/$VERSION/g" /app/public/index.html

RUN yarn install
RUN yarn run build --env=prod

FROM node:10.15.3-alpine
RUN yarn global add serve
COPY --from=builder /app/build /app/build
WORKDIR /app

ENV REACT_APP_ENVIRONMENT=prod
ENV PORT=3000

CMD ["sh", "-c", "serve -p ${PORT} -s build"]
