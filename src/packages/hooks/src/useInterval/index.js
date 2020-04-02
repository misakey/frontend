import { useEffect, useRef, useMemo } from 'react';
import isFunction from '@misakey/helpers/isFunction';
import isNumber from '@misakey/helpers/isNumber';
import noop from '@misakey/helpers/noop';

// HELPERS
const callCbFn = (callbackRef) => {
  if (isFunction(callbackRef.current)) { callbackRef.current(); }
};

// HOOKS
/**
 * useInterval hook, hook version of useInterval
 * @see window.setInterval for more info
 *
 * @param {Function} callback call function on each interval
 * @param {Object} [options = {}]
 * @param {Number} [options.delay] delay in ms between each interval
 * @param {Boolean} [options.runAtStart] immediately run callback
 * @param {Boolean} [options.shouldStart = true] set to true when interval should start
 */
export default (callback, { delay, runAtStart, shouldStart = true } = {}, ...effects) => {
  const callbackRef = useRef();
  callbackRef.current = callback;

  const shouldRunAtStart = useMemo(
    () => runAtStart && shouldStart,
    [runAtStart, shouldStart],
  );

  const shouldStartInterval = useMemo(
    () => shouldStart && isNumber(delay),
    [delay, shouldStart],
  );

  useEffect(
    () => {
      if (shouldRunAtStart) {
        callCbFn(callbackRef);
      }
    },
    [
      ...effects, // eslint-disable-line react-hooks/exhaustive-deps
      shouldRunAtStart, callbackRef,
    ],
  );

  useEffect(
    () => {
      if (shouldStartInterval) {
        const interval = setInterval(() => {
          callCbFn(callbackRef);
        }, delay);
        return () => clearInterval(interval);
      }
      return noop;
    },
    [
      ...effects, // eslint-disable-line react-hooks/exhaustive-deps
      shouldStartInterval, delay, callbackRef,
    ],
  );
};
