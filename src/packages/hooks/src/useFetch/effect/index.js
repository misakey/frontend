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
 *   when true, triggers wrappedFetch from `useFetchCallback`
 * @param {boolean} [fetchConditions.fetchOnlyOnce=false]
 *   when true, limit fetching to a single occurence
 *   usable as an optimization param, avoid when not needed
 *   it can lead to missing updates
 * @param {boolean} [fetchConditions.stopOnError=true]
 *   when true, do not trigger wrappedFetch if `useFetchCallback` errored
 * @param {boolean} [fetchConditions.fetchWhileFetching=false]
 *   when false, do not trigger wrappedFetch if `useFetchCallback` is still fetching
 * @param {[]} props extra props passed down to `useFetchCallback`
 */
export default (
  fetchFn,
  { shouldFetch = true, fetchOnlyOnce = false, stopOnError = true, fetchWhileFetching = false },
  ...props
) => {
  const {
    wrappedFetch,
    internalFetchingCount, internalErrorRef, // internal refs to fetch wrappedFetch state
    ...callbackMeta
  } = useFetchCallback(fetchFn, ...props);

  const wrappedFetchRef = useRef(wrappedFetch);

  const fetchedOnce = useRef(false);

  // safety measure as this effect runs everytime `wrappedFetch` changes
  useEffect(
    () => {
      wrappedFetchRef.current = wrappedFetch;
    },
    [wrappedFetchRef, wrappedFetch],
  );

  // this effect will not be triggered by `wrappedFetch` changes
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
        wrappedFetchRef.current();
        if (fetchedOnce.current === false) {
          fetchedOnce.current = true;
        }
      }
    },
    [
      shouldFetch,
      wrappedFetchRef,
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
