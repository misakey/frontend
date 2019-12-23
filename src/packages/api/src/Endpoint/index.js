import objectToQueryString from '@misakey/helpers/objectToQueryString';
import generatePath from '@misakey/helpers/generatePath';
import isFunction from '@misakey/helpers/isFunction';
import isEmpty from '@misakey/helpers/isEmpty';
import isArray from '@misakey/helpers/isArray';

import send from '@misakey/api/Endpoint/send';

const defaultInnerRules = {
  naming: 'strict',
};

class Endpoint {
  constructor(types, mock, token, middlewares) {
    const { method, path, auth = false, initOptions = {}, innerRules = {} } = types;

    this.auth = auth;
    this.body = undefined;
    this.innerRules = { ...defaultInnerRules, ...innerRules };
    this.method = method;
    this.middlewares = middlewares;
    this.mock = mock;
    this.initOptions = initOptions;
    this.path = path;
    this.requestUri = '';
    this.token = token;

    this.send = send;
  }


  /*
  * MIDDLEWARES
  * A middleware can be added to an Endpoint if we want it specific to the endpoint
  * export const myEndpointWithMiddleware = API.use(...).addMiddleware(...);
  * myEndpointWithMiddleware.build().send()
  */
  setMiddlewares = (middlewares = []) => {
    if (!isArray(middlewares)) {
      throw new Error('middlewares parameter should be instance of Array');
    }
    this.middlewares = middlewares;

    return this;
  };

  addMiddleware = (middleware) => {
    if (!isFunction(middleware)) {
      throw new Error('middleware parameter should be a function');
    }

    this.middlewares.push(middleware);

    return this;
  };

  resetMiddlewares = () => {
    this.middlewares = [];

    return this;
  };

  /* USAGE */
  build(params = {}, body, queryParams = {}, domain = window.env.API_ENDPOINT) {
    this.body = body;

    const path = generatePath(this.path, params);
    let location = path;

    const query = objectToQueryString(queryParams);
    if (!isEmpty(query)) { location = `${path}?${query}`; }

    this.requestUri = `${domain}${location}`;

    return this;
  }

  fakeResponse(httpStatus) {
    return this.mock && new Promise(this.mock.get(httpStatus));
  }
}

export default Endpoint;
