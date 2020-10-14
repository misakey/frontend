import noop from '@misakey/helpers/noop';

const UPLOAD_METHODS = ['POST', 'PUT', 'PATCH'];

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
      onProgress(100);
      if (req.status < 400) {
        resolve(e);
      } else {
        reject(e);
      }
    }, false);

    req.addEventListener('error', (e) => {
      reject(e);
    }, false);

    if (UPLOAD_METHODS.includes(method)) {
      req.upload.addEventListener('progress', (e) => {
        let progress = 0;
        if (e.lengthComputable && e.total !== 0) {
          progress = Math.round((e.loaded / e.total) * 100);
        }
        onProgress(progress);
      }, false);
    } else {
      req.addEventListener('progress', (e) => {
        let progress = 0;
        if (e.lengthComputable && e.total !== 0) {
          progress = Math.round((e.loaded / e.total) * 100);
        }
        onProgress(progress);
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
