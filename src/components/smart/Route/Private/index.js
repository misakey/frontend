import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { getSignInHref } from '@misakey/api/endpoints/auth/helpers';
import Redirect from 'components/smart/Redirect';

/**
 * @FIXME add to @misakey/ui
 * @param Component
 * @param componentProps
 * @param isAuthenticated
 * @param isValid
 * @param rest
 * @returns {*}
 * @constructor
 */
function RoutePrivate({ component: Component, componentProps, isAuthenticated, isValid, ...rest }) {
  const render = (props) => {
    if (isValid(isAuthenticated)) { return <Component {...props} {...componentProps} />; }
    if (isAuthenticated) { return <Component notAllowed {...props} {...componentProps} />; }

    return <Redirect to={getSignInHref()} />;
  };

  return <Route {...rest} render={render} />;
}

RoutePrivate.propTypes = {
  component: PropTypes.func.isRequired,
  componentProps: PropTypes.objectOf(PropTypes.any),
  isValid: PropTypes.func,
  isAuthenticated: PropTypes.bool,
};

RoutePrivate.defaultProps = {
  componentProps: {},
  isAuthenticated: false,
  isValid: isAuthenticated => isAuthenticated,
};

export default connect(
  state => ({ isAuthenticated: !!state.auth.token }),
)(RoutePrivate);
