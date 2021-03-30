import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import { useRouteMatch } from 'react-router-dom';

import ListItem from '@material-ui/core/ListItem';

// COMPONENTS
const ListItemNavLink = forwardRef(({ path, exact, strict, ...rest }, ref) => {
  const routeMatch = useRouteMatch({
    path,
    strict,
    exact,
  });
  const selected = useMemo(
    () => !isNil(routeMatch),
    [routeMatch],
  );

  return (
    <ListItem
      ref={ref}
      selected={selected}
      {...rest}
    />
  );
});

ListItemNavLink.propTypes = {
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  exact: PropTypes.bool,
  strict: PropTypes.bool,
};

ListItemNavLink.defaultProps = {
  exact: false,
  strict: false,
};

export default ListItemNavLink;
