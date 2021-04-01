import isFunction from '@misakey/core/helpers/isFunction';

export default (promiseOrFn) => (isFunction(promiseOrFn)
  ? Promise.resolve(promiseOrFn())
  : Promise.resolve(promiseOrFn));
