import { useMemo, useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { matchPath, useLocation } from 'react-router-dom';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';

import { loadUserThunk, authReset, setExpiresAt } from '@misakey/auth/store/actions/auth';

import log from '@misakey/helpers/log';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import UserManager from '@misakey/auth/classes/UserManager';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useDispatch } from 'react-redux';

import SplashScreenOidc from '@misakey/ui/Screen/Splash/Oidc';
import DialogSigninRedirect from '@misakey/auth/components/OidcProvider/Dialog/SigninRedirect';

// COMPONENTS
function OidcProvider({
  children,
  config,
  registerMiddlewares,
  publicRoute,
  autoSignInExcludedRoutes,
}) {
  const [signinRedirect, setSigninRedirect] = useState(null);
  const [canCancelRedirect, setCanCancelRedirect] = useState(true);

  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const isRouteExcludedForAutomaticSignIn = useMemo(
    () => autoSignInExcludedRoutes.some((excludedRoute) => matchPath(pathname, excludedRoute)),
    [autoSignInExcludedRoutes, pathname],
  );

  const open = useMemo(
    () => !isNil(signinRedirect),
    [signinRedirect],
  );

  const signinRedirectProps = useSafeDestr(signinRedirect);

  const [isLoading, setIsLoading] = useState(false);

  const dispatchUser = useCallback(
    (user) => Promise.resolve(dispatch(loadUserThunk(user))),
    [dispatch],
  );

  const onTokenExpirationChange = useCallback(
    (expiresAt) => {
      if (isRouteExcludedForAutomaticSignIn) {
        // don't need to bother about older expiration if we are under new auth flow
        return;
      }
      if (isNil(expiresAt)) {
        dispatch(authReset());
        return;
      }
      dispatch(setExpiresAt(expiresAt));
      setSigninRedirect(null);
    },
    [dispatch, isRouteExcludedForAutomaticSignIn],
  );

  const userManager = useMemo(
    () => new UserManager(
      {
        ...config,
        automaticSilentRenew: !isRouteExcludedForAutomaticSignIn,
      },
      {
        onUserChange: dispatchUser,
        onTokenExpirationChange,
      },
    ),
    [config, dispatchUser, isRouteExcludedForAutomaticSignIn, onTokenExpirationChange],
  );

  const askSigninRedirect = useCallback(
    (params, canCancel = true) => {
      setSigninRedirect(params);
      setCanCancelRedirect(canCancel);
    },
    [setSigninRedirect, setCanCancelRedirect],
  );

  const onClose = useCallback(
    () => {
      setSigninRedirect(null);
    },
    [setSigninRedirect],
  );

  const contextValue = useMemo(
    () => ({
      userManager,
      askSigninRedirect,
    }),
    [userManager, askSigninRedirect],
  );

  const onLoadUserAtMount = useCallback(
    () => {
      setIsLoading(true);

      // Load user on store when the app is opening
      userManager.getUser()
        .then(async (user) => {
          if (isNil(user)) {
            log('User not found !');
            return Promise.resolve();
          }

          if (user.expired) {
            return userManager.signinRedirect();
          }

          log('User is loaded !');
          return dispatchUser(user);
        })
        .catch((e) => logSentryException(e, 'Fail to retrieve user', { auth: true }))
        .finally(() => setIsLoading(false));
    },
    [dispatchUser, userManager],
  );

  useEffect(
    () => {
      if (!isRouteExcludedForAutomaticSignIn) {
        onLoadUserAtMount();
      }
    },
    [isRouteExcludedForAutomaticSignIn, onLoadUserAtMount],
  );

  useEffect(
    () => {
      if (isFunction(registerMiddlewares)) {
        registerMiddlewares(askSigninRedirect);
      }
    },
    [registerMiddlewares, askSigninRedirect, userManager],
  );

  return (
    <UserManagerContext.Provider value={contextValue}>
      <DialogSigninRedirect
        fullScreen
        open={open}
        onClose={onClose}
        canCancelRedirect={canCancelRedirect}
        userManager={userManager}
        publicRoute={publicRoute}
        {...signinRedirectProps}
      />
      {isLoading ? (
        <SplashScreenOidc />
      ) : children}
    </UserManagerContext.Provider>
  );
}

OidcProvider.propTypes = {
  children: PropTypes.node,
  config: PropTypes.shape({
    authority: PropTypes.string.isRequired,
    automaticSilentRenew: PropTypes.bool,
    clientId: PropTypes.string.isRequired,
    scope: PropTypes.string,
  }),
  registerMiddlewares: PropTypes.func.isRequired,
  publicRoute: PropTypes.string.isRequired,
  autoSignInExcludedRoutes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  ),
};

OidcProvider.defaultProps = {
  children: null,
  config: {
    scope: 'openid tos privacy_policy',
    automaticSilentRenew: true,
  },
  autoSignInExcludedRoutes: [],
};

export default OidcProvider;
