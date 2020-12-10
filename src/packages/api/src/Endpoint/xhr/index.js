import noop from '@misakey/helpers/noop';
import isNil from '@misakey/helpers/isNil';

// CONSTANTS
const UPLOAD_METHODS = ['POST', 'PUT', 'PATCH'];

// HELPERS
const handleResponse = (response) => {
  try {
    return JSON.parse(response);
  } catch (err) {
    return response;
  }
};

const computeProgress = (progressEvent, shouldBeDone = false) => {
  if (progressEvent.lengthComputable && progressEvent.total !== 0) {
    return Math.round((progressEvent.loaded / progressEvent.total) * 100);
  }
  return shouldBeDone ? 100 : 0;
};

/**
 * Send a request with XMLHttpRequest API and an instance of Endpoint
 * Commonly used like this: return `API.use(endpoint).build(params).xhr()`;
 * @param options
 * @param endpoint
 * @returns {Promise<Response>|Promise}
 */
export default (
  { onProgress = noop } = {},
  { getCsrfToken, withCsrfToken, withBearer, path, method, requestUri, body },
) => {
  const req = new XMLHttpRequest();
  // needed for all requests for backend beeing to read HTTP only cookies
  req.withCredentials = true;

  const send = () => new Promise((resolve, reject) => {
    req.addEventListener('load', (e) => {
      onProgress(computeProgress(e, true));
      if (req.status < 400) {
        resolve(handleResponse(req.response));
      } else {
        reject(e);
      }
    }, false);

    req.addEventListener('error', (e) => {
      reject(e);
    }, false);

    if (UPLOAD_METHODS.includes(method)) {
      req.upload.addEventListener('progress', (e) => {
        onProgress(computeProgress(e));
      }, false);
    } else {
      req.addEventListener('progress', (e) => {
        onProgress(computeProgress(e));
      }, false);
    }

    req.addEventListener('abort', (e) => {
      resolve(e);
    }, false);

    req.open(method, requestUri, true);

    if (withBearer) {
      if (isNil(req.getRequestHeader('Authorization'))) {
        throw new Error(`${path} requires tmp access token for Bearer authorization to be truthy`);
      }
    }

    if (withCsrfToken) {
      getCsrfToken().then((xCsrfToken) => {
        if (isNil(xCsrfToken)) { throw new Error(`${path} requires csrf token to be truthy`); }
        // allow receiving & sending cookies by CORS requests
        req.setRequestHeader('X-CSRF-Token', xCsrfToken);
        req.send(body);
      });
      return;
    }

    req.send(body);
  });

  return {
    req,
    send,
  };
};
