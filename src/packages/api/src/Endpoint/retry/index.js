import retry from '@misakey/helpers/retry';

// by default options can be undefined, retry helper sets a default value
export default (requestUri, init, options) => {
  const fn = () => fetch(requestUri, init);
  return retry(fn, options);
};
