import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';

import prop from '@misakey/helpers/prop';

// HELPERS
const getSearch = prop('search');

// COMPONENTS
const RouteSignUp = ({ dirty, start, path, location, ...rest }) => {
  const redirectTo = useMemo(
    () => ({
      pathname: start,
      search: getSearch(location),
    }),
    [location, start],
  );

  if (!dirty && path !== start) {
    return <Redirect to={redirectTo} />;
  }
  return <Route path={path} location={location} {...rest} />;
};

RouteSignUp.propTypes = {
  // FORMIK
  dirty: PropTypes.bool.isRequired,
  // ROUTER
  path: PropTypes.string.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),

  start: PropTypes.string.isRequired,
};

RouteSignUp.defaultProps = {
  location: undefined,
};

export default RouteSignUp;
