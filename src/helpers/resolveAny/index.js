import isFunction from '@misakey/helpers/isFunction';

export default (promiseOrFn) => (isFunction(promiseOrFn)
  ? Promise.resolve(promiseOrFn())
  : Promise.resolve(promiseOrFn));
