import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { signIn } from '@misakey/auth/store/actions/auth';
import { selectors } from '@misakey/auth/store/reducers/auth';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import IdentitySchema from 'store/schemas/Identity';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import any from '@misakey/helpers/any';
import isEmpty from '@misakey/helpers/isEmpty';
import { getIdentity as getIdentityBuilder } from '@misakey/auth/builder/identities';

// HELPERS
const isAnyEmpty = any(isEmpty);


// HOOKS
/**
 * @returns {Object} identityMetadata
 * @returns {string} identityMetadata.id
 *          idToken
 * @returns {string} identityMetadata.token
 *          accessToken
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
  const id = useSelector(selectors.id);
  const token = useSelector(selectors.token);
  const identity = useSelector(selectors.identity);
  const identityId = useSelector(selectors.identityId);

  const dispatch = useDispatch();

  const onSignIn = useCallback(
    (nextIdentity) => {
      const normalized = normalize(nextIdentity, IdentitySchema.entity);
      const { entities } = normalized;
      return Promise.all([
        dispatch(signIn({ identity: nextIdentity })),
        dispatch(receiveEntities(entities)),
      ]);
    },
    [dispatch],
  );

  const shouldFetch = useMemo(
    () => isAnyEmpty([token, identity]) && !isEmpty(identityId),
    [token, identity, identityId],
  );

  const getIdentity = useCallback(
    () => getIdentityBuilder(identityId),
    [identityId],
  );

  const fetchData = useFetchEffect(getIdentity, { shouldFetch }, { onSuccess: onSignIn });

  return useMemo(
    () => ({
      id,
      token,
      identity,
      identityId,
      ...fetchData,
    }),
    [fetchData, id, identity, identityId, token],
  );
};
