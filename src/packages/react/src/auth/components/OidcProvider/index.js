import React, { useMemo, useEffect, useCallback, useState } from 'react';

import PropTypes from 'prop-types';
import { matchPath, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';
import invalidAccessTokenMiddleware from '@misakey/react/auth/middlewares/invalidAccessToken';
import invalidSeclevelMiddleware from '@misakey/react/auth/middlewares/invalidSeclevel';

import { loadUserThunk, authReset, setExpiresAt } from '@misakey/react/auth/store/actions/auth';

import log from '@misakey/core/helpers/log';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import isNil from '@misakey/core/helpers/isNil';
import UserManager from '@misakey/core/auth/classes/UserManager';
import signOutBuilder from '@misakey/core/auth/builder/signOut';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import API from '@misakey/core/api';

import SplashScreenOidc from '@misakey/ui/Screen/Splash/Oidc';
import DialogSigninRedirect from '@misakey/react/auth/components/OidcProvider/Dialog/SigninRedirect';
import authRoutes from '@misakey/react/auth/routes';
import AuthRoutesSwitch from '@misakey/react/auth/components/Route/Switch';

// COMPONENTS
function OidcProvider({ children, config, redirectProps }) {
  const [signinRedirect, setSigninRedirect] = useState(null);
  const [canCancelRedirect, setCanCancelRedirect] = useState(true);

  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const isRouteExcludedForAutomaticSignIn = useMemo(
    // do not try to retrieve old user during auth flow as it useless
    // and could conflict with current auth flow (autoSignIn if user is expired)
    () => [authRoutes._, authRoutes.callback].some(
      (excludedRoute) => matchPath(pathname, excludedRoute),
    ),
    [pathname],
  );

  const open = useMemo(
    () => !isNil(signinRedirect),
    [signinRedirect],
  );

  const signinRedirectProps = useSafeDestr(signinRedirect);

  const [isLoading, setIsLoading] = useState(false);

  const dispatchUser = useCallback(
    ({ identityId, accountId, scope, acr }) => Promise.resolve(
      dispatch(loadUserThunk({ identityId, accountId, scope, acr })),
    ),
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
      config,
      { onUserChange: dispatchUser, onTokenExpirationChange },
    ),
    [config, dispatchUser, onTokenExpirationChange],
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

  const onSignOut = useCallback(
    () => signOutBuilder()
      // userManager.removeUser triggers onTokenExpirationChange which triggers AUTH_RESET
      .then(() => userManager.removeUser()),
    [userManager],
  );

  const contextValue = useMemo(
    () => ({
      userManager,
      askSigninRedirect,
      getUser: userManager.getUser,
      onSignIn: userManager.signinRedirect,
      onSignOut,
    }),
    [userManager, askSigninRedirect, onSignOut],
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

  const onAskHigherACR = useCallback(
    async (requiredAcr) => {
      const { email: identifier } = (await userManager.getUser()) || {};
      const loginHint = isNil(identifier) ? undefined : identifier;
      askSigninRedirect({ acrValues: requiredAcr, prompt: 'login', loginHint }, false);
    },
    [askSigninRedirect, userManager],
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
      API.addMiddleware(invalidAccessTokenMiddleware(dispatch));
      API.addMiddleware(invalidSeclevelMiddleware(onAskHigherACR));
    },
    [dispatch, onAskHigherACR],
  );

  return (
    <UserManagerContext.Provider value={contextValue}>
      <DialogSigninRedirect
        fullScreen
        open={open}
        onClose={onClose}
        canCancelRedirect={canCancelRedirect}
        userManager={userManager}
        {...signinRedirectProps}
      />
      {isLoading
        ? <SplashScreenOidc />
        : (
          <AuthRoutesSwitch redirectProps={redirectProps}>
            {children}
          </AuthRoutesSwitch>
        )}

    </UserManagerContext.Provider>
  );
}

OidcProvider.propTypes = {
  children: PropTypes.node,
  config: PropTypes.shape({
    authority: PropTypes.string.isRequired,
    enableAutomaticSilentRenew: PropTypes.bool,
    clientId: PropTypes.string.isRequired,
    scope: PropTypes.string,
  }),
  redirectProps: PropTypes.object,
};

OidcProvider.defaultProps = {
  children: null,
  config: {
    scope: 'openid tos privacy_policy',
    enableAutomaticSilentRenew: true,
  },
  redirectProps: {},
};

export default OidcProvider;
