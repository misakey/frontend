import React, { useMemo, useEffect, createContext, useCallback, useState, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { STORAGE_PREFIX } from '@misakey/auth/constants';
import { loadUserThunk, authReset } from '@misakey/auth/store/actions/auth';

import log from '@misakey/helpers/log';
import isNil from '@misakey/helpers/isNil';
import isString from '@misakey/helpers/isString';
import isFunction from '@misakey/helpers/isFunction';
import parseJwt from '@misakey/helpers/parseJwt';
import { parseAcr } from '@misakey/helpers/parseAcr';
import createUserManager from '@misakey/auth/helpers/userManager';

import { useLocation } from 'react-router-dom';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import Redirect from '@misakey/ui/Redirect';
import DialogSigninRedirect from '@misakey/auth/components/OidcProvider/Dialog/SigninRedirect';

// CONSTANTS
const OIDC_LOGIN_STORAGE_KEY = `${STORAGE_PREFIX}user:${window.env.AUTH.authority}:`;

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

const isOidcLoginStorageKey = (key) => !isNil(key)
  && isString(key)
  && key.startsWith(OIDC_LOGIN_STORAGE_KEY);

const isAcrChange = (oldValue, newValue) => {
  const { profile: { acr: oldAcr } } = JSON.parse(oldValue);
  const { profile: { acr } } = JSON.parse(newValue);

  return oldAcr !== acr;
};

// CONTEXT
export const UserManagerContext = createContext({
  userManager: null,
  askSigninRedirect: null,
});

// COMPONENTS
function OidcProvider({ store, children, config, registerMiddlewares }) {
  const location = useLocation();
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const [signinRedirect, setSigninRedirect] = useState(null);
  const [canCancelRedirect, setCanCancelRedirect] = useState(true);

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
  const onUserLoaded = useCallback((user) => {
    // the access_token is still valid so we load the user in the store
    if (!isNil(user) && !user.expired) {
      log('User is loaded !');
      return dispatchStoreUpdate(user)
        .then(() => setIsLoading(false));
    }
    log('User not found or expired !');
    setIsLoading(false);
    return Promise.resolve();
  }, [dispatchStoreUpdate]);

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
      .then(onUserLoaded);
  }, [onUserLoaded, userManager]);

  const onStorageEvent = useCallback(
    (e) => {
      const { key, isTrusted, oldValue, newValue } = e;
      // fallback for IE11, Safari<10
      const trusted = isTrusted === true || isNil(isTrusted);
      if (trusted && isOidcLoginStorageKey(key)) {
        if (isNil(newValue) || isNil(oldValue)) {
          // logout or login
          setShouldRefresh(true);
        } else if (isAcrChange(oldValue, newValue)) {
          setShouldRefresh(true);
        }
      }
    },
    [setShouldRefresh],
  );

  useEffect(() => {
    // register the event callbacks
    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addSilentRenewError(onSilentRenewError);

    loadUserAtMount();

    // Remove from store eventual dead signIn request key
    // (it happens when an error occurs in the flow and the backend response
    // doesn't send back the state so we can't remove it with the signInRequestCallback )
    userManager.clearStaleState();

    return function cleanup() {
      // unregister the event callbacks
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeSilentRenewError(onSilentRenewError);
    };
  }, [
    userManager,
    onUserLoaded,
    onSilentRenewError,
    loadUserAtMount,
  ]);

  useEffect(
    () => {
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

  if (shouldRefresh) {
    return (
      <Redirect
        to={location}
        forceRefresh
        manualRedirectPlaceholder={(
          <SplashScreen />
        )}
      />
    );
  }

  return (
    <UserManagerContext.Provider value={contextValue}>
      <DialogSigninRedirect
        open={open}
        onClose={onClose}
        canCancelRedirect={canCancelRedirect}
        userManager={userManager}
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
};

export const withUserManager = (Component) => forwardRef((props, ref) => (
  <UserManagerContext.Consumer>
    {(context) => <Component {...props} {...context} ref={ref} />}
  </UserManagerContext.Consumer>
));

export default OidcProvider;
