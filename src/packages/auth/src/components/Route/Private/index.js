import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { withUserManager } from '@misakey/auth/components/OidcProvider';

function RoutePrivate({
  component: Component,
  componentProps,
  isAuthenticated,
  isValid,
  userManager,
  ...rest
}) {
  const RouteRender = (props) => {
    if (isValid(isAuthenticated)) { return <Component {...props} {...componentProps} />; }
    if (isAuthenticated) { return <Component notAllowed {...props} {...componentProps} />; }

    userManager.signinRedirect();
    return null;
  };

  RouteRender.propTypes = { location: PropTypes.object.isRequired };

  return <Route {...rest} render={RouteRender} />;
}

RoutePrivate.propTypes = {
  component: PropTypes.elementType.isRequired,
  componentProps: PropTypes.objectOf(PropTypes.any),
  isAuthenticated: PropTypes.bool,
  isValid: PropTypes.func,
  userManager: PropTypes.object.isRequired,
};

RoutePrivate.defaultProps = {
  componentProps: {},
  isAuthenticated: false,
  isValid: (isAuthenticated) => isAuthenticated,
};

export default connect(
  (state) => ({ isAuthenticated: !!state.auth.token }),
)(withUserManager(RoutePrivate));
