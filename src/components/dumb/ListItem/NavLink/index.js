import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { Link, useRouteMatch } from 'react-router-dom';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import isNil from '@misakey/helpers/isNil';

import ListItem from '@material-ui/core/ListItem';

const ListItemNavLink = ({ to, exact, strict, ...props }) => {
  const match = useRouteMatch({
    path: to,
    strict,
    exact,
  });

  const selected = useMemo(
    () => !isNil(match),
    [match],
  );

  return (
    <ListItem
      component={Link}
      to={to}
      selected={selected}
      {...props}
    />
  );
};

ListItemNavLink.propTypes = {
  to: TO_PROP_TYPE.isRequired,
  exact: PropTypes.bool,
  strict: PropTypes.bool,
};

ListItemNavLink.defaultProps = {
  exact: false,
  strict: false,
};

export default ListItemNavLink;
