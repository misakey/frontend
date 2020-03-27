import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import routes from 'routes';

import parseJwt from '@misakey/helpers/parseJwt';
import log from '@misakey/helpers/log';
import isNil from '@misakey/helpers/isNil';
import generatePath from '@misakey/helpers/generatePath';

import useFetchCallback from '@misakey/hooks/useFetch/callback';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import { loadUserRoles } from '@misakey/auth/store/actions/auth';

import BoxAction from 'components/dumb/Box/Action';
import SplashScreen from 'components/dumb/Screen/Splash';

export const DEFAULT_DOMAIN = 'intro';
export const DEFAULT_SERVICE_ENTITY = { mainDomain: DEFAULT_DOMAIN };

// @DEPRECIATED: only used in admin workspace

// CONSTANTS
const DEFAULT_SCOPE = 'openid user';

// COMPONENTS
function RouteService({
  component: Component, componentProps,
  dispatchUpdateRoles,
  isAuthenticated,
  requiredScope,
  userHasRole,
  userScope,
  userEmail,
  userId,
  userManager,
  mainDomain,
  workspace,
  t,
  ...rest
}) {
  const signIn = useCallback(() => userManager.signinRedirect(), [userManager]);
  const signInAs = useCallback(() => userManager.signinRedirect({
    ...(!isNil(userEmail) ? { login_hint: userEmail } : {}),
    scope: `${DEFAULT_SCOPE} ${requiredScope}`,
  }), [requiredScope, userEmail, userManager]);

  const [loginAsScreen, setLoginAsScreen] = useState(false);

  const signInSilent = useCallback(
    () => userManager.signinSilent({ scope: `${DEFAULT_SCOPE} ${requiredScope}` }),
    [userManager, requiredScope],
  );

  const onSignInSilentSuccess = useCallback(
    () => log(`Signin silent as ${workspace} succeeded`),
    [workspace],
  );

  const onSignInSilentError = useCallback(
    (err) => {
      log(`Signin silent as ${workspace} failed ${err}`);
      setLoginAsScreen(true);
    },
    [workspace, setLoginAsScreen],
  );

  const { isFetching: loginInProgress, wrappedFetch: signInAsSilent } = useFetchCallback(
    signInSilent,
    { onSucces: onSignInSilentSuccess, onError: onSignInSilentError },
  );

  const pathToClaim = useMemo(
    () => generatePath(routes[workspace].service.claim._, { mainDomain }), [mainDomain, workspace],
  );
  const { replace } = useHistory();
  const redirectToClaim = useCallback(() => { replace(pathToClaim); }, [pathToClaim, replace]);


  const render = (props) => {
    const renderProps = { ...props, ...componentProps };
    const { name } = componentProps;
    if (!isAuthenticated) {
      return (
        <BoxAction
          title={name && t(`components:route.service.titleByComponentName.${name}`)}
          actions={[{
            buttonText: t('common:signIn'),
            onClick: signIn,
          }]}
          {...renderProps}
        />
      );
    }

    if (loginAsScreen) {
      return (
        <BoxAction
          title={t(`components:route.service.loginAs.${workspace}.description`)}
          actions={[{
            buttonText: t(`components:route.service.loginAs.${workspace}.button`),
            onClick: signInAs,
          }]}
          {...renderProps}
        />
      );
    }

    if (mainDomain === DEFAULT_DOMAIN) {
      return (
        <BoxAction
          title={t(`components:route.service.intro.${workspace}.description`)}
          {...renderProps}
        />
      );
    }

    if (!userScope.includes(requiredScope) && userHasRole) {
      if (window.env.AUTH.automaticSilentRenew === false) {
        setLoginAsScreen(true);
        return null;
      }

      if (loginInProgress) {
        return <SplashScreen text={t(`components:route.service.loginAs.${workspace}.loading`)} />;
      }

      signInAsSilent();
      return null;
    }

    const { location } = props;

    if (!userScope.includes(requiredScope) && location.pathname !== pathToClaim) {
      return (
        <BoxAction
          title={name && t(`components:route.service.claim.${workspace}.description`)}
          actions={[
            {
              buttonText: t(`components:route.service.claim.${workspace}.button`),
              onClick: redirectToClaim,
            },
          ]}
          {...renderProps}
        />
      );
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

  return <Route {...rest} render={render} />;
}

RouteService.propTypes = {
  component: PropTypes.elementType.isRequired,
  componentProps: PropTypes.objectOf(PropTypes.any),
  dispatchUpdateRoles: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  t: PropTypes.func.isRequired,
  requiredScope: PropTypes.string.isRequired,
  userScope: PropTypes.string,
  userHasRole: PropTypes.bool,
  userId: PropTypes.string,
  userEmail: PropTypes.string,
  userManager: PropTypes.object.isRequired,
  mainDomain: PropTypes.string.isRequired,
  workspace: PropTypes.string.isRequired,
};

RouteService.defaultProps = {
  componentProps: {},
  isAuthenticated: false,
  userScope: '',
  userEmail: '',
  userId: null,
  userHasRole: false,
};

// CONNECT
const mapStateToProps = (state) => {
  const { sco } = state.auth.id ? parseJwt(state.auth.id) : {};
  const { email } = state.auth.profile || {};
  return {
    isAuthenticated: !!state.auth.token,
    userRoles: state.auth.roles,
    userScope: sco,
    userEmail: email,
    userId: state.auth.userId,
  };
};
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateRoles: (roles) => dispatch(loadUserRoles(roles)),
});

export default withUserManager(
  withTranslation(['components', 'common'])(connect(mapStateToProps, mapDispatchToProps)(RouteService)),
);
