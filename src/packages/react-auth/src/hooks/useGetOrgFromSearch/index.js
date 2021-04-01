import OrganizationsSchema from '@misakey/react-auth/store/schemas/Organizations';
import { makeGetEntitySelector } from '@misakey/store/reducers/entities';

import isNil from '@misakey/core/helpers/isNil';
import isUUID from '@misakey/core/helpers/isUUID';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useOrgId from '@misakey/react-auth/hooks/useOrgId';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import useFetchOrganizationPublicInfo from '@misakey/react-auth/hooks/useFetchOrganizationPublicInfo';

// HOOKS
export default () => {
  const [hasError, setHasError] = useState(false);

  const orgId = useOrgId(false);

  const getOrgEntitySelector = useMemo(
    () => makeGetEntitySelector(OrganizationsSchema.entity),
    [],
  );
  const organization = useSelector((state) => getOrgEntitySelector(state, orgId));

  const onError = useCallback(
    () => setHasError(true),
    [],
  );

  const onFetchOrgPublicInfo = useFetchOrganizationPublicInfo(onError);

  const isValidId = useMemo(
    () => !isNil(orgId) && isUUID(orgId),
    [orgId],
  );

  const onFetchOrgIdPublicInfo = useCallback(
    () => (isValidId ? onFetchOrgPublicInfo(orgId) : undefined),
    [isValidId, onFetchOrgPublicInfo, orgId],
  );

  const shouldFetch = useMemo(
    () => isValidId && isNil(organization) && !hasError,
    [isValidId, hasError, organization],
  );

  const { isFetching } = useFetchEffect(onFetchOrgIdPublicInfo, { shouldFetch });

  return useMemo(
    () => ({ organization, orgId, isFetching, shouldFetch, hasError }),
    [hasError, isFetching, orgId, organization, shouldFetch],
  );
};
