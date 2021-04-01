import exponentialBackoff from '@misakey/core/helpers/exponentialBackoff';
import isFunction from '@misakey/core/helpers/isFunction';

// CONSTANTS
const OPTIONS = {
  retries: 3,
  retryDelay: exponentialBackoff,
};

// HELPERS
const retry = (attempt, retryDelay, wrappedFn) => {
  const delay = isFunction(retryDelay) ? retryDelay(attempt) : retryDelay;
  setTimeout(
    () => wrappedFn(attempt + 1),
    delay,
  );
};

export default (fn, { retries, retryDelay } = OPTIONS) => new Promise(
  (resolve, reject) => {
    const wrappedFn = (attempt) => {
      fn()
        .then(resolve)
        .catch((e) => {
          if (attempt < retries) {
            return retry(attempt, retryDelay, wrappedFn);
          }
          return reject(e);
        });
    };
    wrappedFn(0);
  },
);
