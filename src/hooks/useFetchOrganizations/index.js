import { selectors as orgSelectors } from 'store/reducers/identity/organizations';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';

import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useFetchOrganizationsCallback from 'hooks/useFetchOrganizations/callback';

// CONSTANTS
const { makeDenormalizeOrganizations } = orgSelectors;
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// HOOKS
export default ({ isReady = true, forceRefresh = false } = {}) => {
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

  const getOrganizations = useFetchOrganizationsCallback(meIdentityId);

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
