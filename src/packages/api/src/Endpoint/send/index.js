import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import isFunction from '@misakey/helpers/isFunction';
import isObject from '@misakey/helpers/isObject';
import toLower from '@misakey/helpers/toLower';
import isNil from '@misakey/helpers/isNil';
import map from '@misakey/helpers/map';
import log from '@misakey/helpers/log';
import retry from '@misakey/api/Endpoint/retry';

const DEFAULT_INIT_OPTIONS = {
  redirect: 'follow',
  mode: 'cors',
  // allow receiving & sending cookies by CORS requests
  credentials: 'include',
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
        error.desc = desc || getReasonPhrase(status);
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

    const desc = getReasonPhrase(status);
    const code = toLower(Object.keys(StatusCodes).find((c) => StatusCodes[c] === status));
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
 * Applies middlewares sequentially until one returns something different than nil
 * NB: it stops at first result not nil
 */
const applyMiddlewares = async (requestOrResponse, endpoint) => {
  const { middlewares } = endpoint;
  let middlewareResult;
  let index = 0;

  while (isNil(middlewareResult) && index < middlewares.length - 1) {
    const middleware = middlewares[index];
    if (isFunction(middleware)) {
      // middlewares must be applied sequentially in loop
      // eslint-disable-next-line no-await-in-loop
      middlewareResult = await Promise.resolve(middleware(requestOrResponse, endpoint));
    }
    index += 1;
  }

  return middlewareResult;
};

const makeRequest = async (headers, endpoint, retryOptions) => {
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

  const middlewareRequest = await applyMiddlewares({ requestUri, init }, endpoint);
  return isNil(middlewareRequest)
    ? retry(requestUri, init, retryOptions)
    : Promise.resolve(middlewareRequest);
};

/**
 * Send a request with fetch API and an instance of Endpoint
 * Commonly used like this: return `API.use(endpoint).build(params).send()`;
 * @param options
 * @param endpoint
 * @returns {Promise<Response>|Promise}
 */
async function send(options = {}, endpoint = this) {
  const { rawRequest, contentType = 'application/json', headers: optionsHeaders, retryOptions } = options;
  const mergedEndpoint = { ...this, ...endpoint };
  const { withCsrfToken, withBearer, path, getCsrfToken } = mergedEndpoint;

  let headers = new Headers();
  if (optionsHeaders instanceof Headers) {
    headers = optionsHeaders;
  } else if (isObject(optionsHeaders)) {
    map(optionsHeaders, (value, key) => { headers.set(key, value); });
  }

  if (contentType) { headers.set('Content-Type', contentType); }
  if (withBearer) {
    if (isNil(headers.get('Authorization'))) {
      throw new Error(`${path} requires tmp access token for Bearer authorization to be truthy`);
    }
  }
  if (withCsrfToken) {
    const xCsrfToken = await getCsrfToken();
    if (isNil(xCsrfToken)) {
      throw new Error(`${path} requires csrf token to be truthy`);
    }
    headers.set('X-CSRF-Token', xCsrfToken);
  }

  try {
    const rawResponse = await makeRequest(headers, mergedEndpoint, retryOptions);
    if (rawRequest) {
      return rawResponse;
    }
    const middlewareResponse = await applyMiddlewares(rawResponse, mergedEndpoint);
    return isNil(middlewareResponse) ? handleResponse(rawResponse) : middlewareResponse;
  } catch (error) {
    const middlewareError = await applyMiddlewares(error, mergedEndpoint);
    const finalError = isNil(middlewareError) ? error : middlewareError;
    // if final error is not an error, consider middlewares handled it
    if (finalError instanceof Error) {
      log(finalError);
      throw finalError;
    }
    return finalError;
  }
}

export default send;
