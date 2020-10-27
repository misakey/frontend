import React, { useMemo } from 'react';

import routes from 'routes';


import ListItemNavLink from 'components/dumb/ListItem/NavLink';
import ListItemNavLinkMisakeySkeleton from 'components/smart/ListItem/NavLink/Misakey/Skeleton';
import { generatePath } from 'react-router-dom';
import useIdentity from 'hooks/useIdentity';

const ListItemNavLinkMisakey = (props) => {
  const { identityId, isFetching } = useIdentity();

  const to = useMemo(
    () => generatePath(routes.identities._, { id: identityId }),
    [identityId],
  );

  if (isFetching) {
    return <ListItemNavLinkMisakeySkeleton />;
  }

  return (
    <ListItemNavLink to={to} {...props} />
  );
};

export default ListItemNavLinkMisakey;
