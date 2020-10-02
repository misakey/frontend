import exponentialBackoff from '@misakey/helpers/exponentialBackoff';
import isFunction from '@misakey/helpers/isFunction';

// CONSTANTS
const OPTIONS = {
  retries: 3,
  retryDelay: exponentialBackoff,
};

// HELPERS
const retry = (attempt, retryDelay, wrappedFetch) => {
  const delay = isFunction(retryDelay) ? retryDelay(attempt) : retryDelay;
  setTimeout(
    () => wrappedFetch(attempt + 1),
    delay,
  );
};

export default (requestUri, init, { retries, retryDelay } = OPTIONS) => new Promise(
  (resolve, reject) => {
    const wrappedFetch = (attempt) => {
      fetch(requestUri, init)
        .then(resolve)
        .catch((e) => {
          if (attempt < retries) {
            return retry(attempt, retryDelay, wrappedFetch);
          }
          return reject(e);
        });
    };
    wrappedFetch(0);
  },
);
