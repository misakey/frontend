import noop from '@misakey/helpers/noop';

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
  { token, auth, path, method, requestUri, body },
) => {
  const req = new XMLHttpRequest();

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

    if (auth) {
      if (!token) { throw new Error(`${path} requires token to be truthy`); }
      // allow receiving & sending cookies by CORS requests
      req.withCredentials = true;
      req.setRequestHeader('X-CSRF-Token', token);
    }

    req.send(body);
  });

  return {
    req,
    send,
  };
};
