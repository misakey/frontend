import PropTypes from 'prop-types';
import React, { useEffect, createContext } from 'react';
import log from '@misakey/helpers/log';
import isNil from '@misakey/helpers/isNil';
import parseJwt from '@misakey/helpers/parseJwt';
import { loadUser, authReset, loadUserRoles } from '../../store/actions/auth';
import createUserManager from '../../helpers/userManager';
import useGetRoles from '../../hooks/useGetRoles';

export const UserManagerContext = createContext({
  userManager: null,
});

function OidcProvider({ store, children, config }) {
  const userManager = createUserManager(config);
  const fetchUserRoles = useGetRoles((roles) => store.dispatch(loadUserRoles(roles)));

  useEffect(() => {
    // event callback when the user has been loaded (on silent renew or redirect)
    const onUserLoaded = (user) => {
      log('User is loaded !');
      // the access_token is still valid so we load the user in the store
      if (user && !user.expired) {
        if (store) {
          const userId = parseJwt(user.id_token).sub;
          store.dispatch(loadUser({
            expiryAt: user.expires_at,
            token: user.access_token,
            id: user.id_token,
            authenticatedAt: user.profile.auth_time,
            userId,
          }));

          const { auth } = store.getState();

          if (isNil(auth.roles)) {
            fetchUserRoles(userId);
          }
        }

        const userHasChangedEvent = new StorageEvent('userHasChanged', { bubbles: true });
        window.dispatchEvent(userHasChangedEvent);
      }
    };

    // event callback when silent renew errored
    const onSilentRenewError = () => {
      log('Fail to renew token silently...');
      if (store) {
        store.dispatch(authReset());
      }
    };

    // event callback when the access token expired
    const onAccessTokenExpired = () => {
      log('User token is expired !');
      // @TODO could be removed when https://github.com/IdentityModel/oidc-client-js/issues/787
      // will be implemented
      if (userManager.settings.automaticSilentRenew) {
        userManager.signinSilent().then(() => {
          log('OidcProvider.onAccessTokenExpired: Silent token renewal successful');
        }, (err) => {
          log(`OidcProvider.onAccessTokenExpired: Error from signinSilent: ${err.message}`);
        });
      }
    };

    // register the event callbacks
    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addSilentRenewError(onSilentRenewError);
    userManager.events.addAccessTokenExpired(onAccessTokenExpired);

    // Load user on store when the app is opening
    userManager.getUser().then((user) => {
      if (user) {
        onUserLoaded(user);
      } else if (userManager.settings.automaticSilentRenew) {
        userManager.signinSilent()
          .then(() => {
            log('OidcProvider.initialSilentAuth: Silent auth successful');
          }, (err) => {
            log(`OidcProvider.initialSilentAuth: Error from signinSilent: ${err}`);
          });
      }
    });
    // Remove from store eventual dead signIn request key
    // (it happens when an error occurs in the flow and the backend response
    // doesn't send back the state so we can't remove it with the signInRequestCallback )
    userManager.clearStaleState();

    return function cleanup() {
      // unregister the event callbacks
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeSilentRenewError(onSilentRenewError);
      userManager.events.removeAccessTokenExpired(onAccessTokenExpired);
    };
  }, [userManager, store, fetchUserRoles]);


  return (
    <UserManagerContext.Provider value={{ userManager }}>
      {children}
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
};

OidcProvider.defaultProps = {
  children: null,
  config: {
    response_type: 'code',
    scope: 'openid user',
    automaticSilentRenew: true,
    loadUserInfo: false,
  },
  store: null,
};

export const withUserManager = (Component) => (props) => (
  <UserManagerContext.Consumer>
    {(store) => <Component {...props} {...store} />}
  </UserManagerContext.Consumer>
);

export default OidcProvider;
