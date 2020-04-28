import isFunction from '@misakey/helpers/isFunction';
import isArray from '@misakey/helpers/isArray';

import endpoints from './endpoints';
import Endpoint from '../Endpoint';
import { HTTP_ERROR_STATUSES, filterHttpStatus } from './errors';

function toFormErrors({ details = {} }) {
  return details;
}

class API {
  constructor() {
    this.endpoints = endpoints;
    this.errors = {
      httpStatus: HTTP_ERROR_STATUSES,
      filter: filterHttpStatus,
      toFormErrors,
    };
    this.middlewares = [];
    this.token = null;
  }

  /* TOKEN */
  getToken = () => this.token;

  setToken = (token) => { this.token = token; };

  deleteToken = () => { this.token = null; };

  /* MIDDLEWARES */
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
  use = (
    endpoint = {},
    token = this.token,
    middlewares = this.middlewares,
  ) => new Endpoint(endpoint, endpoint.mock, token, middlewares);
}

export default API;
