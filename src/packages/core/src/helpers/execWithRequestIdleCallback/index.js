import isFunction from '@misakey/core/helpers/isFunction';

// Don't wait more than two seconds before launching the function
// For now requestIdleCallback is used for function
// that used asked so we cannot wait long for execute them
export default (fn, options = { timeout: 2000 }, abortIfUnavailable = false) => {
  if (typeof window !== 'undefined' && isFunction(window.requestIdleCallback)) {
    window.requestIdleCallback(fn, options);
  } else if (!abortIfUnavailable) {
    fn();
  }
};
