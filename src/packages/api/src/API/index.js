import isFunction from '@misakey/helpers/isFunction';
import isArray from '@misakey/helpers/isArray';
import isNil from '@misakey/helpers/isNil';
import alwaysNull from '@misakey/helpers/always/null';
import { getCsrfTokenBuilder } from '@misakey/api/helpers/builder/getCsrfToken';
import invalidCsrfTokenMiddleware from '@misakey/api/API/middlewares/invalidCsrfToken';
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
    this.addMiddleware(
      invalidCsrfTokenMiddleware(this.deleteCsrfToken),
    );
    this.xCsrfToken = null;
  }

  /* CSRF TOKEN */
  getCsrfToken = () => {
    if (isNil(this.xCsrfToken)) {
      return getCsrfTokenBuilder()
        .then((xCsrfToken) => {
          this.xCsrfToken = xCsrfToken;
          return this.xCsrfToken;
        })
        .catch(alwaysNull);
    }
    return Promise.resolve(this.xCsrfToken);
  }

  setCsrfToken = (xCsrfToken) => { this.xCsrfToken = xCsrfToken; };

  deleteCsrfToken = () => {
    this.xCsrfToken = null;
  };

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
    getCsrfToken = this.getCsrfToken,
    middlewares = this.middlewares,
  ) => new Endpoint(endpoint, endpoint.mock, getCsrfToken, middlewares);
}

export default API;
