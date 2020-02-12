import { useState, useCallback, useRef, useEffect } from 'react';
import { useSnackbar } from 'notistack';

import isFunction from '@misakey/helpers/isFunction';
import log from '@misakey/helpers/log';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

// CONSTANTS
const CALLED_WHILE_FETCHING = '[useFetchCallback] Warning: callback was called during fetching lifecycle';

// HELPERS
const callPromise = (arg) => (isFunction(arg) ? Promise.resolve(arg()) : Promise.resolve(arg));

// HOOKS
/**
 * useFetchCallback hook, designed for user interaction callback on data fetching, such as `onClick`
 * Not recommended for Formik's `onSubmit`
 * @see useFetchEffect for effects
 *
 * @param {Function<Promise>} fetchFn
 * @param {Object} [callbacks]
 * @param {Function<String>} [callbacks.snackbarError]
 *   on error, call function and trigger snackbar with returned value as text
 * @param {Function<String>} [callbacks.snackbarSuccess]
 *   on success, call function and trigger snackbar returned value as text
 * @param {(Function<Promise>|Boolean)} [callbacks.onError]
 *   - when true, on error run `useHandleGenericHttpErrors` hook,
 *   - when function, on error run function
 *       catch possible rethrown errors with `useHandleGenericHttpErrors` hook
 * @param {Function} [callbacks.onSuccess] run function on success
 * @param {Function} [callbacks.onFinally] run function on finally
 */
export default (
  fetchFn,
  { snackbarError, snackbarSuccess, onError, onSuccess, onFinally } = {},
) => {
  const [data, setData] = useState();
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  // handle component unmount with a ref
  const isCanceled = useRef(false);

  // internal ref to hunt inconsistent states
  // should always be 0 or 1.
  // 0 = not fetching
  // 1 = fetching
  const internalFetchingCount = useRef(0);
  const internalErrorRef = useRef();

  const { enqueueSnackbar } = useSnackbar();

  const cancel = useCallback(
    () => {
      isCanceled.current = true;
    },
    [isCanceled],
  );

  const handleStart = useCallback(
    () => {
      setIsFetching(true);
      internalFetchingCount.current += 1;
    },
    [setIsFetching, internalFetchingCount],
  );

  const onErrorWithGeneric = useCallback(
    (e) => {
      // handleGenericHttpErrors when asked
      if (onError === true) {
        return handleGenericHttpErrors(e);
      }

      // run handler
      if (isFunction(onError)) {
        return onError(e);
      }

      throw e;
    },
    [handleGenericHttpErrors, onError],
  );

  const handleError = useCallback(
    (e) => {
      if (isFunction(snackbarError)) {
        enqueueSnackbar(snackbarError(e), { variant: 'error' });
      }

      // only trigger state update if component is still mounted
      if (!isCanceled.current) {
        setError(e);
        internalErrorRef.current = e;
      }

      return onErrorWithGeneric(e);
    },
    [isCanceled, enqueueSnackbar, setError, snackbarError, onErrorWithGeneric, internalErrorRef],
  );

  const handleSuccess = useCallback(
    (result) => {
      if (isFunction(snackbarSuccess)) {
        enqueueSnackbar(snackbarSuccess(result), { variant: 'success' });
      }

      // only trigger state update if component is still mounted
      if (!isCanceled.current) {
        setData(result);
      }

      return isFunction(onSuccess)
        ? onSuccess(result)
        : result;
    },
    [isCanceled, enqueueSnackbar, setData, snackbarSuccess, onSuccess],
  );

  const handleFinally = useCallback(
    () => {
      // only trigger state update if component is still mounted
      if (!isCanceled.current) {
        setIsFetching(false);
        internalFetchingCount.current -= 1;
      }

      return isFunction(onFinally)
        ? onFinally()
        : undefined;
    },
    [isCanceled, setIsFetching, internalFetchingCount, onFinally],
  );

  const callback = useCallback(
    () => {
      handleStart();

      return callPromise(fetchFn)
        .then(handleSuccess)
        .catch(handleError)
        .catch(handleGenericHttpErrors) // catch rethrown errors from handleError
        .finally(handleFinally);
    },
    [handleStart, fetchFn, handleSuccess, handleError, handleGenericHttpErrors, handleFinally],
  );

  useEffect(
    () => () => { cancel(); }, // effect is triggered on unmount: cancel promise on unmount
    [cancel],
  );

  // debug purpose
  useEffect(
    () => {
      if (internalFetchingCount.current > 1 || internalFetchingCount.current < 0) {
        // log warn in dev mode, with stack trace
        log(CALLED_WHILE_FETCHING, 'warn', 'development', true);
      }
    },
    [internalFetchingCount],
  );

  return { data, error, isFetching, callback, internalFetchingCount, internalErrorRef };
};
