import { useMemo, useCallback, useRef, useEffect, useReducer } from 'react';
import { useSnackbar } from 'notistack';

import isFunction from '@misakey/core/helpers/isFunction';
import log from '@misakey/core/helpers/log';
import resolveAny from '@misakey/core/helpers/resolveAny';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

// CONSTANTS
const CALLED_WHILE_FETCHING = '[useFetchCallback] Warning: callback was called during fetching lifecycle';

const ERROR = Symbol('ERROR');
const DATA = Symbol('DATA');
const FETCHING = Symbol('FETCHING');
const DONE = Symbol('DONE');
const RESET = Symbol('RESET');

const INITIAL_STATE = {
  data: undefined,
  error: null,
  called: false,
  isFetching: false,
  done: false,
};

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
 * @param {(Function<Promise>)} [callbacks.onError]
 *   run function on error
 *   catch possible rethrown errors with `useHandleGenericHttpErrors` hook
 * @param {Function} [callbacks.onSuccess] run function on success
 * @param {Function} [callbacks.onFinally] run function on finally
 * @param {Boolean} [noGenericErrorHandling=false]
 *   do not catch errors with useHandleGenericHttpErrors
 */
export default (
  fetchFn,
  { snackbarError, snackbarSuccess, onError, onSuccess, onFinally } = {},
  noGenericErrorHandling = false,
) => {
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  // handle component unmount with a ref
  const isCanceled = useRef(false);

  // internal ref to hunt inconsistent states
  // should always be 0 or 1.
  // 0 = not fetching
  // 1 = fetching
  const internalFetchingCount = useRef(0);
  const internalErrorRef = useRef();

  const reducer = useCallback(
    (state, { type, data, error }) => {
      // only trigger state update if component is still mounted
      if (isCanceled.current || type === RESET) {
        return INITIAL_STATE;
      }
      if (type === ERROR) {
        internalErrorRef.current = error;
        return { ...state, error };
      }
      if (type === FETCHING) {
        internalFetchingCount.current += 1;
        internalErrorRef.current = undefined;
        return { ...state,
          isFetching: true,
          called: true,
          done: false,
          error: INITIAL_STATE.error };
      }
      if (type === DONE) {
        internalFetchingCount.current -= 1;
        return { ...state, isFetching: false, done: true };
      }
      if (type === DATA) {
        return { ...state, data };
      }
      return state;
    },
    [isCanceled, internalErrorRef, internalFetchingCount],
  );

  const [{ data, error, isFetching, done, called }, dispatch] = useReducer(reducer, INITIAL_STATE);

  const { enqueueSnackbar } = useSnackbar();

  const cancel = useCallback(
    () => {
      isCanceled.current = true;
    },
    [isCanceled],
  );

  const handleStart = useCallback(
    () => {
      dispatch({ type: FETCHING });
    },
    [dispatch],
  );

  const onErrorFunction = useCallback(
    (e) => {
      // run onError
      if (isFunction(onError)) {
        return onError(e);
      }

      // rethrow error for next catch
      throw e;
    },
    [onError],
  );

  const onErrorGeneric = useCallback(
    (e) => {
      if (noGenericErrorHandling) {
        throw e;
      }
      // handleGenericHttpErrors
      return handleGenericHttpErrors(e);
    },
    [handleGenericHttpErrors, noGenericErrorHandling],
  );

  const handleError = useCallback(
    (e) => {
      if (isFunction(snackbarError)) {
        enqueueSnackbar(snackbarError(e), { variant: 'error' });
      }

      dispatch({ type: ERROR, error: e });

      return onErrorFunction(e);
    },
    [snackbarError, onErrorFunction, enqueueSnackbar, dispatch],
  );

  const handleSuccess = useCallback(
    (result) => {
      if (isFunction(snackbarSuccess)) {
        enqueueSnackbar(snackbarSuccess(result), { variant: 'success' });
      }

      dispatch({ type: DATA, data: result });

      return isFunction(onSuccess)
        ? onSuccess(result)
        : result;
    },
    [enqueueSnackbar, snackbarSuccess, onSuccess, dispatch],
  );

  const handleFinally = useCallback(
    () => {
      dispatch({ type: DONE });

      return isFunction(onFinally)
        ? onFinally()
        : undefined;
    },
    [onFinally, dispatch],
  );

  const wrappedFetch = useCallback(
    () => {
      handleStart();

      return resolveAny(fetchFn)
        .then(handleSuccess)
        .catch(handleError)
        .catch(onErrorGeneric) // catch rethrown errors from handleError
        .finally(handleFinally);
    },
    [handleStart, fetchFn, handleSuccess, handleError, onErrorGeneric, handleFinally],
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

  return useMemo(
    () => ({
      data,
      error,
      isFetching,
      done,
      called,
      wrappedFetch,
      internalFetchingCount,
      internalErrorRef,
    }),
    [called, data, done, error, isFetching, wrappedFetch],
  );
};
