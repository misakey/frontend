import React, { useMemo, useEffect, createContext, useCallback, useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { matchPath, useLocation } from 'react-router-dom';

import { loadUserThunk, authReset } from '@misakey/auth/store/actions/auth';

import log from '@misakey/helpers/log';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import parseJwt from '@misakey/helpers/parseJwt';
import { parseAcr } from '@misakey/helpers/parseAcr';
import createUserManager from '@misakey/auth/helpers/userManager';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import DialogSigninRedirect from '@misakey/auth/components/OidcProvider/Dialog/SigninRedirect';

// HELPERS
const getUser = ({
  profile: { acr, sco: scope, auth_time: authenticatedAt, csrf_token: token } = {},
  expires_at: expiryAt,
  id_token: id,
}) => ({
  expiryAt,
  token,
  id,
  authenticatedAt,
  scope,
  isAuthenticated: !!token,
  acr: parseAcr(acr),
});

// CONTEXT
export const UserManagerContext = createContext({
  userManager: null,
  askSigninRedirect: null,
});

// COMPONENTS
function OidcProvider({
  store,
  children,
  config,
  registerMiddlewares,
  publicRoute,
  autoSignInExcludedRoutes,
}) {
  const [signinRedirect, setSigninRedirect] = useState(null);
  const [canCancelRedirect, setCanCancelRedirect] = useState(true);

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

  const userManager = useMemo(
    () => createUserManager(config),
    [config],
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

  const [isLoading, setIsLoading] = useState(false);

  const dispatchLoadUser = useCallback(
    (user, identityId, accountId) => store.dispatch(loadUserThunk({
      ...getUser(user),
      identityId,
      accountId,
    })),
    [store],
  );

  const dispatchStoreUpdate = useCallback(
    (user) => {
      if (isNil(store)) {
        return Promise.resolve();
      }

      const { mid: identityId, aid: accountId } = parseJwt(user.id_token);
      return Promise.resolve(dispatchLoadUser(user, identityId, accountId));
    },
    [dispatchLoadUser, store],
  );

  // event callback when the user has been loaded (on silent renew or redirect)
  const onUserLoaded = useCallback(
    async (user) => {
      if (isNil(user)) {
        log('User not found !');
        return Promise.resolve();
      }

      if (user.expired) {
        return userManager.signinRedirect();
      }

      // the access_token is still valid so we load the user in the store
      log('User is loaded !');
      return dispatchStoreUpdate(user);
    },
    [dispatchStoreUpdate, userManager],
  );

  // event callback when silent renew errored
  const onSilentRenewError = useCallback((e) => {
    log(`Fail to renew token silently... ${e}`);
    if (store) {
      store.dispatch(authReset());
    }
  }, [store]);

  const loadUserAtMount = useCallback(() => {
    setIsLoading(true);

    // Load user on store when the app is opening
    userManager.getUser()
      .then(onUserLoaded)
      .catch((e) => log(`Fail to retrieve user: ${e}`))
      .finally(() => setIsLoading(false));
  }, [onUserLoaded, userManager]);

  const onStorageEvent = useCallback(
    (e) => {
      const { key, isTrusted, newValue } = e;
      // fallback for IE11, Safari<10
      const trusted = isTrusted === true || isNil(isTrusted);
      if (trusted && userManager.userStorageKey === key) {
        if (!isNil(newValue)) {
          loadUserAtMount();
          setSigninRedirect(null);
        } else if (store) {
          store.dispatch(authReset());
        }
      }
    },
    [loadUserAtMount, store, userManager.userStorageKey],
  );

  useEffect(
    () => {
      if (!isRouteExcludedForAutomaticSignIn) {
        loadUserAtMount();
      }
    },
    [isRouteExcludedForAutomaticSignIn, loadUserAtMount],
  );

  // This effet should only be fired at app launch as it clean eventual residual keys in storage
  useEffect(
    () => {
      // Remove from store eventual dead signIn request key
      // (it happens when an error occurs in the flow and the backend response
      // doesn't send back the state so we can't remove it with the signInRequestCallback )
      // we could remove it if it became problematic as we use sessionStorage for state
      // it must be cleaned on browser closing
      if (!isRouteExcludedForAutomaticSignIn) {
        try {
          userManager.clearStaleState();
        } catch (e) {
          // Do not show nor throw error as it's not blocking for using app
          log(`Fail to clear localStorage from residual oidc:state, ${e}`);
        }
      }
    },
    [isRouteExcludedForAutomaticSignIn, userManager],
  );

  useEffect(
    () => {
      // register the event callbacks
      userManager.events.addUserLoaded(onUserLoaded);
      userManager.events.addSilentRenewError(onSilentRenewError);

      return function cleanup() {
        // unregister the event callbacks
        userManager.events.removeUserLoaded(onUserLoaded);
        userManager.events.removeSilentRenewError(onSilentRenewError);
      };
    },
    [onSilentRenewError, onUserLoaded, userManager.events],
  );

  useEffect(
    () => {
      // Ensure consistency between multi tabs
      window.addEventListener('storage', onStorageEvent);
      return () => {
        window.removeEventListener('storage', onStorageEvent);
      };
    },
    [onStorageEvent],
  );

  useEffect(
    () => {
      if (isFunction(registerMiddlewares)) {
        registerMiddlewares(askSigninRedirect);
      }
    },
    [registerMiddlewares, askSigninRedirect],
  );

  return (
    <UserManagerContext.Provider value={contextValue}>
      <DialogSigninRedirect
        open={open}
        onClose={onClose}
        canCancelRedirect={canCancelRedirect}
        userManager={userManager}
        publicRoute={publicRoute}
        {...signinRedirectProps}
      />
      {isLoading ? (
        <SplashScreen />
      ) : children}
    </UserManagerContext.Provider>
  );
}

OidcProvider.propTypes = {
  children: PropTypes.node,
  config: PropTypes.shape({
    authority: PropTypes.string.isRequired,
    automaticSilentRenew: PropTypes.bool,
    client_id: PropTypes.string.isRequired,
    loadUserInfo: PropTypes.bool,
    redirect_uri: PropTypes.string.isRequired,
    response_type: PropTypes.string,
    scope: PropTypes.string,
  }),
  store: PropTypes.object,
  registerMiddlewares: PropTypes.func.isRequired,
  publicRoute: PropTypes.string.isRequired,
  autoSignInExcludedRoutes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  ),
};

OidcProvider.defaultProps = {
  children: null,
  config: {
    response_type: 'code',
    scope: 'openid tos privacy_policy',
    automaticSilentRenew: true,
    loadUserInfo: false,
  },
  store: null,
  autoSignInExcludedRoutes: [],
};

export const withUserManager = (Component) => forwardRef((props, ref) => (
  <UserManagerContext.Consumer>
    {(context) => <Component {...props} {...context} ref={ref} />}
  </UserManagerContext.Consumer>
));

export default OidcProvider;
