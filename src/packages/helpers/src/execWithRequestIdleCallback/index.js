import isFunction from '@misakey/helpers/isFunction';

// Don't wait more than two seconds before launching the function
// For now requestIdleCallback is used for function
// that used asked so we cannot wait long for execute them
export default (fn, options = { timeout: 2000 }) => {
  if (isFunction(window.requestIdleCallback)) {
    window.requestIdleCallback(fn, options);
  } else {
    fn();
  }
};
