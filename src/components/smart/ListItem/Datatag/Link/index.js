import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

import routes from 'routes';

import getNextSearch from '@misakey/core/helpers/getNextSearch';
import isSelfOrg from 'helpers/isSelfOrg';
import isNil from '@misakey/core/helpers/isNil';

import ListItem from '@material-ui/core/ListItem';

// COMPONENTS
const ListItemDatatagLink = forwardRef(({ id, organizationId, nextSearchMap, ...rest }, ref) => {
  const { search } = useLocation();

  const isSelfOrgDatatag = useMemo(
    () => isSelfOrg(organizationId),
    [organizationId],
  );

  const datatagToSearchMap = useMemo(
    () => {
      if (isNil(organizationId)) {
        return new Map([
          ['datatagId', id],
          ...nextSearchMap,
        ]);
      }
      return new Map([
        ['datatagId', id],
        ['orgId', isSelfOrgDatatag ? undefined : organizationId],
        ...nextSearchMap,
      ]);
    },
    [id, isSelfOrgDatatag, nextSearchMap, organizationId],
  );

  const datatagTo = useMemo(
    () => ({
      pathname: routes.boxes._,
      search: getNextSearch(search, datatagToSearchMap),
    }),
    [datatagToSearchMap, search],
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
  nextSearchMap: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

ListItemDatatagLink.defaultProps = {
  nextSearchMap: [],
};

export default ListItemDatatagLink;
