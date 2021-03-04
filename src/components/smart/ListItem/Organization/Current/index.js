import React, { useMemo } from 'react';

import { selectors as orgSelectors } from 'store/reducers/identity/organizations';

import isSelfOrg from 'helpers/isSelfOrg';
import isNil from '@misakey/helpers/isNil';

import useFetchOrganizations from 'hooks/useFetchOrganizations';
import useOrgId from 'hooks/useOrgId';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ListItemOrganizationSkeleton from '@misakey/ui/ListItem/Organization/Skeleton';
import ListItemOrganizationSelf from 'components/smart/ListItem/Organization/Self';
import ListItemOrganization from '@misakey/ui/ListItem/Organization';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

// COMPONENTS
const ListItemOrganizationCurrent = (props) => {
  const orgId = useOrgId();

  const selfOrgSelected = useMemo(
    () => isSelfOrg(orgId),
    [orgId],
  );

  const { isFetching, shouldFetch } = useFetchOrganizations({ isReady: !selfOrgSelected });

  const denormalizeOrganizationSelector = useMemo(
    () => makeDenormalizeOrganization(),
    [],
  );
  const organization = useSelector((state) => denormalizeOrganizationSelector(state, orgId));
  const { name } = useSafeDestr(organization);

  if (selfOrgSelected) {
    return <ListItemOrganizationSelf {...props} />;
  }

  if (isFetching || shouldFetch || isNil(organization)) {
    return (
      <ListItemOrganizationSkeleton disabled {...props} />
    );
  }

  return (
    <ListItemOrganization
      name={name}
      {...props}
    />
  );
};

export default ListItemOrganizationCurrent;
