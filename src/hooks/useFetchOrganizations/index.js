import { receiveOrganizations, selectors as orgSelectors } from 'store/reducers/identity/organizations';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import { listOrganizations } from '@misakey/helpers/builder/identities';
import isNil from '@misakey/helpers/isNil';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

// CONSTANTS
const { makeDenormalizeOrganizations } = orgSelectors;
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// HOOKS
export default ({ isReady = true, forceRefresh = false } = {}) => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const meIdentityId = useSelector(IDENTITY_ID_SELECTOR);

  const denormalizeOrgsSelector = useMemo(
    () => makeDenormalizeOrganizations(),
    [],
  );

  const organizations = useSelector((state) => denormalizeOrgsSelector(state, meIdentityId));

  const shouldFetch = useMemo(
    () => (isNil(organizations) || forceRefresh) && isReady && !isNil(meIdentityId),
    [organizations, forceRefresh, isReady, meIdentityId],
  );

  const dispatchReceiveOrganizations = useCallback(
    (orgs) => Promise.resolve(
      dispatch(receiveOrganizations(orgs, meIdentityId)),
    ),
    [dispatch, meIdentityId],
  );

  const getOrganizations = useCallback(
    () => listOrganizations(meIdentityId)
      .then(dispatchReceiveOrganizations)
      .catch(handleHttpErrors),
    [dispatchReceiveOrganizations, handleHttpErrors, meIdentityId],
  );

  const fetchMetadata = useFetchEffect(
    getOrganizations,
    { shouldFetch },
  );

  return useMemo(
    () => ({
      organizations,
      shouldFetch,
      ...fetchMetadata,
    }),
    [organizations, shouldFetch, fetchMetadata],
  );
};
