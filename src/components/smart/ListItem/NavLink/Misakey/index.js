import React, { useMemo } from 'react';

import authRoutes from '@misakey/react/auth/routes';

import ListItemNavLink from '@misakey/ui/ListItem/NavLink';
import ListItemNavLinkMisakeySkeleton from 'components/smart/ListItem/NavLink/Misakey/Skeleton';
import { generatePath } from 'react-router-dom';
import useIdentity from '@misakey/react/auth/hooks/useIdentity';

// CONSTANTS
const PATH = authRoutes.identities._;

// COMPONENTS
const ListItemNavLinkMisakey = (props) => {
  const { identityId, isFetching } = useIdentity();

  const to = useMemo(
    () => generatePath(PATH, { id: identityId }),
    [identityId],
  );

  if (isFetching) {
    return <ListItemNavLinkMisakeySkeleton />;
  }

  return (
    <ListItemNavLink path={PATH} to={to} {...props} />
  );
};

export default ListItemNavLinkMisakey;
