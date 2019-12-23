import { useEffect, useMemo, useRef } from 'react';
import isFunction from '@misakey/helpers/isFunction';
import isNumber from '@misakey/helpers/isNumber';

// CONSTANTS
const NO_DELAY = 0;
const DEFAULT_DELAY = 1000;

// HELPERS
const callCbFn = (callbackRef) => {
  if (isFunction(callbackRef.current)) { callbackRef.current(); }
};

const getDelay = (delay, immediateRun) => {
  if (immediateRun === true) {
    return NO_DELAY;
  }
  if (isNumber(delay)) {
    return delay;
  }
  return DEFAULT_DELAY;
};

// HOOKS
const useDelay = (delay, immediateRun) => useMemo(
  () => getDelay(delay, immediateRun), [delay, immediateRun],
);

export default (callback, { delay, immediateRun } = {}, ...effects) => {
  const callbackRef = useRef();
  callbackRef.current = callback;

  const actualDelay = useDelay(delay, immediateRun);

  return useEffect(() => {
    const timeout = setTimeout(() => {
      callCbFn(callbackRef);
    }, actualDelay);
    return () => clearTimeout(timeout);
  }, [...effects, immediateRun]); // eslint-disable-line react-hooks/exhaustive-deps
};
