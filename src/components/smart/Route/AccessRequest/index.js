import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

import Fallback from './Fallback';

function RouteAccessRequest({
  component: Component, componentProps,
  dispatch, isAuthenticated, isConfirmed, ...rest
}) {
  // User is not a [CONFIRMED_VISITOR] and is not Authenticated
  // or user is Authenticated and doesn't have the right role for the page
  // then return the RouteAccessRequest
  // else everything is right

  const Render = (props) => {
    const renderProps = { ...props, ...componentProps };
    const roleDenied = true;
    if (!isConfirmed && (!isAuthenticated || roleDenied)) {
      return <Fallback isAuthenticated={isAuthenticated} {...renderProps} />;
    }

    return <Component isAuthenticated={isAuthenticated} {...renderProps} />;
  };

  Render.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mainDomain: PropTypes.string,
        databoxId: PropTypes.string,
      }),
    }).isRequired,
  };

  return <Route {...rest} component={Render} />;
}

RouteAccessRequest.propTypes = {
  accessToken: PropTypes.shape({
    token: PropTypes.string,
    createdAt: PropTypes.string,
    expiresAt: PropTypes.string,
    subject: PropTypes.string,
    scope: PropTypes.string,
  }),
  component: PropTypes.elementType.isRequired,
  componentProps: PropTypes.objectOf(PropTypes.any),
  dispatch: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  isConfirmed: PropTypes.bool,
};

RouteAccessRequest.defaultProps = {
  accessToken: {},
  componentProps: {},
  isAuthenticated: false,
  isConfirmed: false,
};

export default connect(
  (state) => ({
    accessToken: state.accessToken,
    isConfirmed: !!state.accessToken.token,
    isAuthenticated: !!state.auth.token,
  }),
)(RouteAccessRequest);
