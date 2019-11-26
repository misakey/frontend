import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import BoxAction from 'components/dumb/Box/Action';

import parseJwt from '@misakey/helpers/parseJwt';
import log from '@misakey/helpers/log';

import { withUserManager } from '@misakey/auth/components/OidcProvider';

import SplashScreen from 'components/dumb/SplashScreen';

function RouteCitizen({
  component: Component, componentProps,
  t,
  userScope,
  userManager,
  isPrivate,
  ...rest
}) {
  const [loginAsScreen, setLoginAsScreen] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const signIn = useCallback(() => userManager.signinRedirect(), [userManager]);
  const render = (props) => {
    const renderProps = { ...props, ...componentProps };

    if (loginAsScreen) {
      return (
        <BoxAction
          title={t('screens:Citizen.Actions.loginAs.description')}
          actions={[{
            buttonText: t('screens:Citizen.Actions.loginAs.button'),
            onClick: signIn,
          }]}
          {...renderProps}
        />
      );
    }

    if (userScope !== 'openid user' && !loginInProgress && !window.env.PLUGIN) {
      setLoginInProgress(true);
      userManager.signinSilent({ scope: 'openid user' })
        .then(() => {
          log('Silent auth as citizen succeed');
        })
        .catch((err) => {
          log(`Silent auth as citizen failed ${err}`);
          setLoginAsScreen(true);
        })
        .finally(() => {
          setLoginInProgress(false);
        });
      return <SplashScreen text={t('screens:Citizen.Actions.loginAs.loading')} />;
    }

    return <Component {...renderProps} />;
  };

  render.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mainDomain: PropTypes.string,
      }),
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
  };

  if (isPrivate) {
    return <RoutePrivate {...rest} render={render} />;
  }

  return <Route {...rest} render={render} />;
}

RouteCitizen.propTypes = {
  component: PropTypes.elementType.isRequired,
  componentProps: PropTypes.objectOf(PropTypes.any),
  t: PropTypes.func.isRequired,
  userScope: PropTypes.string,
  userManager: PropTypes.object.isRequired,
  isPrivate: PropTypes.bool,
};

RouteCitizen.defaultProps = {
  componentProps: {},
  userScope: '',
  isPrivate: false,
};

// CONNECT
const mapStateToProps = (state) => {
  const { sco } = state.auth.id ? parseJwt(state.auth.id) : {};
  return { userScope: sco };
};

export default withUserManager(
  withTranslation(['screens', 'auth'])(connect(mapStateToProps, null)(RouteCitizen)),
);
