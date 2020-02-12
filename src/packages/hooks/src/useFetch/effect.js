import { useEffect, useRef } from 'react';

import isNil from '@misakey/helpers/isNil';

import useFetchCallback from '@misakey/hooks/useFetch/callback';

// HOOKS
/**
 * useFetchEffect hook, designed for conditional manual data fetching
 * @see useFetchCallback dependency
* @param {Function<Promise>} fetchFn
 * @param {Object} [fetchConditions]
 * @param {boolean} [fetchConditions.shouldFetch=true]
 *   when true, triggers callback from `useFetchCallback`
 * @param {boolean} [fetchConditions.fetchOnlyOnce=false]
 *   when true, limit fetching to a single occurence
 *   usable as an optimization param, avoid when not needed
 *   it can lead to missing updates
 * @param {boolean} [fetchConditions.stopOnError=false]
 *   when true, do not triger callback if `useFetchCallback` errored
 * @param {boolean} [fetchConditions.fetchWhileFetching=false]
 *   when false, do not trigger callback if `useFetchCallback` is still fetching
 * @param {[]} props extra props passed down to `useFetchCallback`
 */
export default (
  fetchFn,
  { shouldFetch = true, fetchOnlyOnce = false, stopOnError = false, fetchWhileFetching = false },
  ...props
) => {
  const {
    callback,
    internalFetchingCount, internalErrorRef, // internal refs to fetch callback state
    ...callbackMeta
  } = useFetchCallback(fetchFn, ...props);

  const callbackRef = useRef(callback);

  const fetchedOnce = useRef(false);

  // safety measure as this effect runs everytime `callback` changes
  useEffect(
    () => {
      callbackRef.current = callback;
    },
    [callbackRef, callback],
  );

  // this effect will not be triggered by `callback` changes
  useEffect(
    () => {
      const needToFetch = fetchOnlyOnce
        ? (shouldFetch && fetchedOnce.current === false)
        : shouldFetch;

      // internalFetchingCount ref does not trigger effect when inner value changes,
      // still, we can limit calls by checking its value when effect is triggered
      const internalFetchingValid = fetchWhileFetching ? true : internalFetchingCount.current === 0;
      const internalErrorValid = stopOnError ? isNil(internalErrorRef.current) : true;

      if (needToFetch && internalFetchingValid && internalErrorValid) {
        callbackRef.current();
        fetchedOnce.current = true;
      }
    },
    [
      shouldFetch,
      callbackRef,
      fetchedOnce,
      fetchOnlyOnce,
      stopOnError,
      fetchWhileFetching,
      internalFetchingCount,
      internalErrorRef,
    ],
  );

  // return metadata from `useFetchCallback`
  // I chose not to pass down internal refs for the moment
  return callbackMeta;
};
