import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';

import getNextSearch from '@misakey/helpers/getNextSearch';
import isSelfOrg from 'helpers/isSelfOrg';

import ListItem from '@material-ui/core/ListItem';
import { Link } from 'react-router-dom';

// COMPONENTS
const ListItemDatatagLink = forwardRef(({ id, organizationId, ...rest }, ref) => {
  const isSelfOrgDatatag = useMemo(
    () => isSelfOrg(organizationId),
    [organizationId],
  );

  const datatagTo = useMemo(
    () => ({
      pathname: routes.boxes._,
      search: getNextSearch('', new Map([
        ['datatagId', id],
        ['orgId', isSelfOrgDatatag ? undefined : organizationId],
      ])),
    }),
    [id, isSelfOrgDatatag, organizationId],
  );

  return (
    <ListItem
      ref={ref}
      button
      component={Link}
      id={id}
      to={datatagTo}
      {...rest}
    />
  );
});

ListItemDatatagLink.propTypes = {
  id: PropTypes.string.isRequired,
  organizationId: PropTypes.string.isRequired,
};

export default ListItemDatatagLink;
