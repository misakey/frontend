import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { useLocation } from 'react-router-dom';
import getSearchParams from '@misakey/helpers/getSearchParams';

import isNil from '@misakey/helpers/isNil';

import OrganizationsSchema from '@misakey/react-auth/store/schemas/Organizations';
import { makeGetEntitySelector } from '@misakey/store/reducers/entities';
import useFetchOrganizationPublicInfo from '@misakey/react-auth/hooks/useFetchOrganizationPublicInfo';
import isUUID from '@misakey/helpers/isUUID';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

export default () => {
  const { search } = useLocation();
  const [hasError, setHasError] = useState(false);

  const { orgId } = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const getOrgEntitySelector = makeGetEntitySelector(OrganizationsSchema.entity);
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

  return { organization, isFetching, hasError };
};
