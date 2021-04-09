import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { selectors } from '@misakey/react/auth/store/reducers/auth';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import isEmpty from '@misakey/core/helpers/isEmpty';
import useIdentityCallback from '@misakey/react/auth/hooks/useIdentity/callback';

// HOOKS
/**
 * @returns {Object} identityMetadata
 * @returns {string} identityMetadata.isAuthenticated
 *          isAuthenticated
 * @returns {string} identityMetadata.identityId
 *          id of identity
 * @returns {Object} identityMetadata.identity
 *          identity
 * @returns {Object} identityMetadata.data
 *          data returned by fetch
 * @returns {Object} identityMetadata.error
 *          error returned by fetch
 * @returns {boolean} identityMetadata.isFetching
 *          fetching status returned by fetch
 */
export default () => {
  // SELECTORS
  const isAuthenticated = useSelector(selectors.isAuthenticated);
  const identity = useSelector(selectors.identity);
  const identityId = useSelector(selectors.identityId);

  const getIdentityBuilder = useIdentityCallback();
  const fetchIdentity = useCallback(
    () => getIdentityBuilder(identityId),
    [getIdentityBuilder, identityId],
  );

  const shouldFetch = useMemo(
    () => isEmpty(identity) && !isEmpty(identityId) && isAuthenticated,
    [isAuthenticated, identity, identityId],
  );

  const fetchData = useFetchEffect(fetchIdentity, { shouldFetch });

  return useMemo(
    () => ({
      isAuthenticated,
      identity,
      identityId,
      shouldFetch,
      ...fetchData,
    }),
    [fetchData, shouldFetch, identity, identityId, isAuthenticated],
  );
};
