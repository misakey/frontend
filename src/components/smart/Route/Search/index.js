import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Route, useLocation } from 'react-router-dom';

import getSearchParams from '@misakey/helpers/getSearchParams';
import whereEq from '@misakey/helpers/whereEq';

// COMPONENTS
const RouteSearch = ({ route: RouteComponent, searchParams, ...rest }) => {
  const { search } = useLocation();

  const locationSearchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const match = useMemo(
    () => whereEq(searchParams, locationSearchParams),
    [searchParams, locationSearchParams],
  );

  if (match) {
    return <RouteComponent {...rest} />;
  }
  return null;
};

RouteSearch.propTypes = {
  route: PropTypes.elementType,
  searchParams: PropTypes.objectOf(PropTypes.string),
};

RouteSearch.defaultProps = {
  route: Route,
  searchParams: {},
};

export default RouteSearch;
