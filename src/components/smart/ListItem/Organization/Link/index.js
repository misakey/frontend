import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';

import getNextSearch from '@misakey/helpers/getNextSearch';

import ListItemOrganization from '@misakey/ui/ListItem/Organization';
import { Link } from 'react-router-dom';

// COMPONENTS
const ListItemOrganizationLink = forwardRef(({ id, ...rest }, ref) => {
  const orgTo = useMemo(
    () => ({
      pathname: routes.boxes._,
      search: getNextSearch('', new Map([['orgId', id]])),
    }),
    [id],
  );

  return (
    <ListItemOrganization
      ref={ref}
      button
      component={Link}
      id={id}
      to={orgTo}
      {...rest}
    />
  );
});

ListItemOrganizationLink.propTypes = {
  id: PropTypes.string.isRequired,
};

export default ListItemOrganizationLink;
