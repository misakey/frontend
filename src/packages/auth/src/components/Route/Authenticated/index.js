import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import { useSelector } from 'react-redux';

import { Route } from 'react-router-dom';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
const RouteAuthenticated = ({ route: RouteComponent, options, ...rest }) => {
  const { userManager } = useContext(UserManagerContext);

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  if (isAuthenticated) {
    return <RouteComponent {...rest} />;
  }

  // redirect to sign in
  userManager.signinRedirect(objectToSnakeCase(options));
  return null;
};

RouteAuthenticated.propTypes = {
  route: PropTypes.elementType,
  options: PropTypes.object,
};

RouteAuthenticated.defaultProps = {
  route: Route,
  options: {},
};

export default RouteAuthenticated;
