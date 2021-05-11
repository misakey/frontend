import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';

import getNextSearch from '@misakey/core/helpers/getNextSearch';
import isNil from '@misakey/core/helpers/isNil';

import { useRouteMatch, Link } from 'react-router-dom';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';

import ListItemOrganization from '@misakey/ui/ListItem/Organization';


// COMPONENTS
const ListItemOrganizationLink = forwardRef(({ id, ...rest }, ref) => {
  const orgTo = useMemo(
    () => ({
      pathname: routes.organizations._,
      search: getNextSearch('', new Map([['orgId', id]])),
    }),
    [id],
  );

  const routeMatch = useRouteMatch({
    path: routes.organizations._,
  });
  const orgId = useOrgId();


  const selected = useMemo(
    () => !isNil(routeMatch) && orgId === id,
    [id, orgId, routeMatch],
  );

  return (
    <ListItemOrganization
      ref={ref}
      button
      component={Link}
      id={id}
      to={orgTo}
      selected={selected}
      {...rest}
    />
  );
});

ListItemOrganizationLink.propTypes = {
  id: PropTypes.string.isRequired,
};

export default ListItemOrganizationLink;
