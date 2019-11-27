import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import routes from 'routes';

import parseJwt from '@misakey/helpers/parseJwt';
import log from '@misakey/helpers/log';
import generatePath from '@misakey/helpers/generatePath';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import { loadUserRoles } from '@misakey/auth/store/actions/auth';

import BoxAction from 'components/dumb/Box/Action';
import SplashScreen from 'components/dumb/SplashScreen';
import useLocationSearchParams from 'hooks/useLocationSearchParams';


// @FIXME: factorize with src/components/smart/Layout/Search.js
const useLaunchSearch = (locationSearchParams, push) => useCallback(
  () => {
    const nextSearch = new URLSearchParams(locationSearchParams);
    nextSearch.set('search', '');
    push({
      search: nextSearch.toString(),
    });
  },
  [locationSearchParams, push],
);

export const DEFAULT_DOMAIN = 'intro';
export const DEFAULT_SERVICE_ENTITY = { mainDomain: DEFAULT_DOMAIN };

function RouteService({
  component: Component, componentProps,
  dispatchUpdateRoles,
  isAuthenticated,
  t,
  requiredScope,
  userHasRole,
  userScope,
  userId,
  userManager,
  mainDomain,
  workspace,
  ...rest
}) {
  const signIn = useCallback(() => userManager.signinRedirect(), [userManager]);
  const signInAs = useCallback(() => userManager.signinRedirect({ scope: `openid user ${requiredScope}` }), [requiredScope, userManager]);
  const [loginAsScreen, setLoginAsScreen] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const pathToClaim = useMemo(
    () => generatePath(routes[workspace].service.claim._, { mainDomain }), [mainDomain, workspace],
  );
  const locationSearchParams = useLocationSearchParams();
  const { push, replace } = useHistory();
  const redirectToClaim = useCallback(() => { replace(pathToClaim); }, [pathToClaim, replace]);
  const launchSearch = useLaunchSearch(locationSearchParams, push);

  const render = (props) => {
    const renderProps = { ...props, ...componentProps };
    const { name } = componentProps;
    if (!isAuthenticated) {
      return (
        <BoxAction
          title={name && t(`auth:signIn.titleByComponentName.${name}`)}
          actions={[{
            buttonText: t('auth:signIn.title'),
            onClick: signIn,
          }]}
          {...renderProps}
        />
      );
    }

    if (loginAsScreen) {
      return (
        <BoxAction
          title={t(`screens:Service.Actions.loginAs.${workspace}.description`)}
          actions={[{
            buttonText: t(`screens:Service.Actions.loginAs.${workspace}.button`),
            onClick: signInAs,
          }]}
          {...renderProps}
        />
      );
    }

    if (mainDomain === DEFAULT_DOMAIN) {
      return (
        <BoxAction
          title={t(`screens:Service.Intro.${workspace}.description`)}
          actions={[
            {
              buttonText: t('screens:Service.Intro.searchService'),
              onClick: launchSearch,
            },
          ]}
          {...renderProps}
        />
      );
    }

    if (userHasRole && !userScope.includes(requiredScope)) {
      if (loginInProgress) {
        return <SplashScreen text={t(`screens:Service.Actions.loginAs.${workspace}.loading`)} />;
      }
      setLoginInProgress(true);
      userManager.signinSilent({ scope: `openid user ${requiredScope}` })
        .then(() => {
          log(`Signin silent as ${workspace} succeed`);
        })
        .catch((err) => {
          log(`Signin silent as ${workspace} failed ${err}`);
          setLoginAsScreen(true);
        })
        .finally(() => {
          setLoginInProgress(false);
        });
    }
    const { location } = props;

    if (!userHasRole && location.pathname !== pathToClaim) {
      return (
        <BoxAction
          title={name && t(`screens:Service.Actions.claim.${workspace}.description`)}
          actions={[
            {
              buttonText: t('screens:Service.Actions.search_other.button'),
              onClick: launchSearch,
            },
            {
              buttonText: t(`screens:Service.Actions.claim.${workspace}.button`),
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
  userManager: PropTypes.object.isRequired,
  mainDomain: PropTypes.string.isRequired,
  workspace: PropTypes.string.isRequired,
};

RouteService.defaultProps = {
  componentProps: {},
  isAuthenticated: false,
  userScope: '',
  userId: null,
  userHasRole: false,
};

// CONNECT
const mapStateToProps = (state) => {
  const { sco } = state.auth.id ? parseJwt(state.auth.id) : {};
  return {
    isAuthenticated: !!state.auth.token,
    userRoles: state.auth.roles,
    userScope: sco,
    userId: state.auth.userId,
  };
};
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateRoles: (roles) => dispatch(loadUserRoles(roles)),
});

export default withUserManager(
  withTranslation(['screens', 'auth'])(connect(mapStateToProps, mapDispatchToProps)(RouteService)),
);
