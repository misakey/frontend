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
 * @returns {Promise<Response>|Promise}
 */
export function handleResponse(rawResponse) {
  // From now, network errors should have already been thrown and caught

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

const applyMiddlewares = (requestOrResponse, endpoint) => {
  const { middlewares } = endpoint;
  let middlewareResult;
  // @FIXME: be careful with this "stop once something is returned" implem of our middlewares
  middlewares.some((middleware) => {
    if (isFunction(middleware)) {
      middlewareResult = middleware(requestOrResponse, endpoint);

      return !!middlewareResult;
    }

    return false;
  });

  return middlewareResult;
};

const makeRequest = (headers, endpoint) => {
  const { initOptions, method, requestUri, body } = endpoint;
  const contentType = headers.get('Content-Type');
  const init = {
    ...DEFAULT_INIT_OPTIONS,
    ...initOptions,
    method,
    headers,
  };

  if (!isNil(body)) {
    init.body = contentType === 'application/json'
      ? JSON.stringify(body)
      : body;
  }

  const middlewareRequest = applyMiddlewares({ requestUri, init }, endpoint);
  return isNil(middlewareRequest)
    ? fetch(requestUri, init)
    : Promise.resolve(middlewareRequest);
};

/**
 * Send a request with fetch API and an instance of Endpoint
 * Commonly used like this: return `API.use(endpoint).build(params).send()`;
 * @param options
 * @param endpoint
 * @returns {Promise<Response>|Promise}
 */
function send(options = {}, endpoint = this) {
  const { rawRequest, contentType = 'application/json', headers: optionsHeaders } = options;
  const { token, auth, path } = endpoint;

  let headers = new Headers();
  if (optionsHeaders instanceof Headers) {
    headers = optionsHeaders;
  } else if (isObject(optionsHeaders)) {
    map(optionsHeaders, (value, key) => { headers.set(key, value); });
  }

  if (contentType) { headers.set('Content-Type', contentType); }
  if (auth) {
    if (!token) { throw new Error(`${path} requires token to be truthy`); }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const request = makeRequest(headers, endpoint);

  if (rawRequest === true) { return request; }

  return request
    .then((rawResponse) => {
      const middlewareResponse = applyMiddlewares(rawResponse, endpoint);
      return isNil(middlewareResponse) ? handleResponse(rawResponse) : middlewareResponse;
    })
    .catch((error) => {
      log(error);
      throw error;
    });
}

export default send;
