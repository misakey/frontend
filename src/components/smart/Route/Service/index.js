import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import AuthSignIn from 'components/screen/Auth/SignIn';
import ServiceSearchSimple from 'components/screen/Service/Search/Simple';

export const DEFAULT_DOMAIN = 'service';
export const DEFAULT_SERVICE_ENTITY = { mainDomain: DEFAULT_DOMAIN };

function RouteService({ component: Component, componentProps, isAuthenticated, t, ...rest }) {
  const render = (props) => {
    const renderProps = { ...props, ...componentProps };

    const { name } = componentProps;
    if (!isAuthenticated) {
      return (
        <AuthSignIn
          title={name && t(`auth:signIn.titleByComponentName.${name}`)}
          {...renderProps}
        />
      );
    }

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
  t: PropTypes.func.isRequired,
};

RouteService.defaultProps = {
  componentProps: {},
  isAuthenticated: false,
};

export default withTranslation('auth')(connect(
  state => ({ isAuthenticated: !!state.auth.token }),
)(RouteService));
