import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import AuthSignIn from 'components/screen/Auth/SignIn';
import ServiceSearchSimple from 'components/screen/Service/Search/Simple';

const DEFAULT_DOMAIN = 'service';

function RouteService({ component: Component, componentProps, isAuthenticated, ...rest }) {
  const render = (props) => {
    const renderProps = { ...props, ...componentProps };

    if (!isAuthenticated) { return <AuthSignIn {...renderProps} />; }

    const { match } = props;
    const { mainDomain } = match.params;
    if (mainDomain === DEFAULT_DOMAIN) { return <ServiceSearchSimple {...renderProps} />; }

    return <Component {...renderProps} />;
  };

  render.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mainDomain: PropTypes.string,
      }),
    }).isRequired,
  };

  return <Route {...rest} render={render} />;
}

RouteService.propTypes = {
  component: PropTypes.elementType.isRequired,
  componentProps: PropTypes.objectOf(PropTypes.any),
  isAuthenticated: PropTypes.bool,
};

RouteService.defaultProps = {
  componentProps: {},
  isAuthenticated: false,
};

export default connect(
  state => ({ isAuthenticated: !!state.auth.token }),
)(RouteService);
