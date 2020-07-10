import React, { useMemo } from 'react';

import routes from 'routes';
import { MISAKEY_ACCOUNT_ID } from 'constants/account';

import useAccountId from 'hooks/useAccountId';

import ListItemNavLink from 'components/dumb/ListItem/NavLink';
import ListItemNavLinkMisakeySkeleton from 'components/smart/ListItem/NavLink/Misakey/Skeleton';
import { generatePath } from 'react-router-dom';
import useIdentity from 'hooks/useIdentity';

const ListItemNavLinkMisakey = (props) => {
  const { identity, isFetching } = useIdentity();
  const accountId = useAccountId(identity);

  const to = useMemo(
    () => generatePath(routes.accounts._, { id: accountId || MISAKEY_ACCOUNT_ID }),
    [accountId],
  );

  if (isFetching) {
    return <ListItemNavLinkMisakeySkeleton />;
  }

  return (
    <ListItemNavLink to={to} {...props} />
  );
};

export default ListItemNavLinkMisakey;
