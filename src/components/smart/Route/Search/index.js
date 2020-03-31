import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

import useSearchMatch from 'hooks/useSearchMatch';

// COMPONENTS
const RouteSearch = ({ route: RouteComponent, searchParams, ...rest }) => {
  const match = useSearchMatch(searchParams);

  if (match) {
    return <RouteComponent {...rest} />;
  }
  return null;
};

RouteSearch.propTypes = {
  route: PropTypes.elementType,
  searchParams: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

RouteSearch.defaultProps = {
  route: Route,
  searchParams: {},
};

export default RouteSearch;
