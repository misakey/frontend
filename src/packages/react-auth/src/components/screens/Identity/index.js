import React from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from 'routes';

import useIdentity from '@misakey/react-auth/hooks/useIdentity';

import IdentityDisplayName from '@misakey/react-auth/components/screens/Identity/DisplayName';
import IdentityNotifications from '@misakey/react-auth/components/screens/Identity/Notifications';
import IdentityColors from '@misakey/react-auth/components/screens/Identity/Colors';
import IdentityAvatar from '@misakey/react-auth/components/screens/Identity/Avatar';
import IdentityPublic from '@misakey/react-auth/components/screens/Identity/Public';
import RouteAcr from '@misakey/react-auth/components/Route/Acr';
import Accounts from '@misakey/react-auth/components/screens/Identity/Account';

// COMPONENTS
function Identity(props) {
  const identityMetadata = useIdentity();

  return (
    <Switch>
      <Route
        exact
        path={routes.identities.public}
        render={(routerProps) => (
          <IdentityPublic {...routerProps} {...identityMetadata} {...props} />
        )}
      />
      <Route
        exact
        path={routes.identities.displayName}
        render={(routerProps) => (
          <IdentityDisplayName
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
      <Route
        exact
        path={routes.identities.notifications}
        render={(routerProps) => (
          <IdentityNotifications
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
      <Route
        exact
        path={routes.identities.colors}
        render={(routerProps) => (
          <IdentityColors
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
      <Route
        path={routes.identities.avatar._}
        render={(routerProps) => (
          <IdentityAvatar
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
      <RouteAcr
        acr={2}
        options={{ prompt: 'login' }}
        path={routes.identities.accounts._}
        component={Accounts}
      />
    </Switch>
  );
}

export default Identity;
