import HttpStatus from 'http-status-codes';

import isFunction from '@misakey/helpers/isFunction';
import isObject from '@misakey/helpers/isObject';
import toLower from '@misakey/helpers/toLower';
import isNil from '@misakey/helpers/isNil';
import map from '@misakey/helpers/map';
import log from '@misakey/helpers/log';

const DEFAULT_INIT_OPTIONS = {
  redirect: 'follow',
  mode: 'cors',
  credentials: 'same-origin',
  cache: 'default',
};

export const getErrorDescriptor = (status, json) => {
  // eslint-disable-next-line camelcase
  const { error_code, error_description } = json; // deprecated
  const { code = error_code, desc = error_description } = json;

  return `[ERROR ${status}] - ${code}: ${desc}`;
};

/**
 * Handles server responses
 *
 * https://gitlab.misakey.dev/misakey/dev-manifesto/blob/master/conventions.md#error-conventions
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * Informational responses (100–199),
 * Successful responses (200–299),
 * Redirects (300–399),
 * Client errors (400–499),
 * and Server errors (500–599).
 *
 * @param rawResponse
 * @param middlewares
 * @param endpoint
 * @returns {Promise<Response>|Promise}
 */
export function handleResponse(rawResponse, middlewares = [], endpoint) {
  // From now, network errors should have already be thrown and caught

  // Middlewares are good ways to handle specific response
  // like a 401 unauthorized that removed the token locally
  let middlewareResponse;
  middlewares.some((middleware) => {
    if (isFunction(middleware)) {
      middlewareResponse = middleware(rawResponse, endpoint);

      return !!middlewareResponse;
    }

    return false;
  });

  if (middlewareResponse !== undefined) { return middlewareResponse; }

  const { status } = rawResponse;
  const contentType = rawResponse.headers.get('Content-Type') || '';

  if (!status) {
    throw new Error('No status is provided by the server !');
  }

  if (status >= 400) {
    if (contentType.startsWith('application/json')) {
      return rawResponse.json().then((json) => {
        const error = new Error(getErrorDescriptor(status, json));

        const { code, desc, origin, details } = json;

        error.status = status;
        error.code = code;
        error.desc = desc || HttpStatus.getStatusText(status);
        error.origin = origin;
        error.details = details;
        error.rawResponse = rawResponse;

        // These fields are deprecated
        error.httpStatus = status;
        error.error_code = json.error_code;
        error.description = json.error_description;
        error.httpText = rawResponse.statusText;

        throw error;
      });
    }

    const desc = HttpStatus.getStatusText(status);
    const code = toLower(Object.keys(HttpStatus).find((c) => HttpStatus[c] === status));
    const error = new Error(getErrorDescriptor(status, { code, desc }));

    error.status = status;
    error.code = code;
    error.desc = desc;
    error.rawResponse = rawResponse;

    throw error;
  } if (status >= 200) {
    // @FIXME
    // Don't think it's necessary to put this condition
    // in the package because it's a special case from databox
    // that need to be handle by databox itself
    if (contentType.startsWith('application/octet-stream')) {
      return rawResponse.blob().then((blob) => ({
        httpStatus: rawResponse.status,
        blob,
      }));
    }

    // However 'application/json' is the most common contentType
    // So it musts be handled by the package
    if (contentType.startsWith('application/json')) {
      return rawResponse.json().then((json) => json);
    }
  }

  // The rawResponse can be treated locally
  // Includes gateway and informational responses (100–199)
  return rawResponse;
}

/**
 * Send a request with fetch API and an instance of Endpoint
 * Commonly used like this: return `API.use(endpoint).build(params).send()`;
 * @param options
 * @param endpoint
 * @returns {Promise<Response>|Promise}
 */
function send(options = {}, endpoint = this) {
  const { rawRequest, contentType = 'application/json' } = options;
  const { body, method, middlewares, initOptions, token } = endpoint;

  let headers = new Headers();
  if (options.headers instanceof Headers) {
    headers = options.headers;
  } else if (isObject(options.headers)) {
    map(options.headers, (value, key) => { headers.set(key, value); });
  }

  if (contentType) { headers.set('Content-Type', contentType); }
  if (endpoint.auth) {
    if (!token) { throw new Error(`${endpoint.path} requires token to be truthy`); }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resource = endpoint.requestUri;
  const init = {
    ...DEFAULT_INIT_OPTIONS,
    ...initOptions,
    method,
    headers,
  };

  if (!isNil(body)) {
    if (contentType === 'application/json') {
      init.body = JSON.stringify(body);
    } else { init.body = body; }
  }

  const request = fetch(resource, init);

  if (rawRequest === true) { return request; }

  return request
    .then((rawResponse) => handleResponse(rawResponse, middlewares, endpoint))
    .catch((error) => {
      log(error);
      throw error;
    });
}

export default send;
