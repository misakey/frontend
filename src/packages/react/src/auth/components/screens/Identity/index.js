import React from 'react';
import { Switch, Route } from 'react-router-dom';

import authRoutes from '@misakey/react/auth/routes';

import useIdentity from '@misakey/react/auth/hooks/useIdentity';

import IdentityDisplayName from '@misakey/react/auth/components/screens/Identity/DisplayName';
import IdentityNotifications from '@misakey/react/auth/components/screens/Identity/Notifications';
import IdentityColors from '@misakey/react/auth/components/screens/Identity/Colors';
import IdentityAvatar from '@misakey/react/auth/components/screens/Identity/Avatar';
import IdentityPublic from '@misakey/react/auth/components/screens/Identity/Public';
import Accounts from '@misakey/react/auth/components/screens/Identity/Account';
import RoutePasswordRequired from '@misakey/react/auth/components/Route/PasswordRequired';

// COMPONENTS
function Identity(props) {
  const identityMetadata = useIdentity();

  return (
    <Switch>
      <Route
        exact
        path={authRoutes.identities.public}
        render={(routerProps) => (
          <IdentityPublic {...routerProps} {...identityMetadata} {...props} />
        )}
      />
      <Route
        exact
        path={authRoutes.identities.displayName}
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
        path={authRoutes.identities.notifications}
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
        path={authRoutes.identities.colors}
        render={(routerProps) => (
          <IdentityColors
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
      <Route
        path={authRoutes.identities.avatar._}
        render={(routerProps) => (
          <IdentityAvatar
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
      <RoutePasswordRequired
        path={authRoutes.identities.accounts._}
        component={Accounts}
      />
    </Switch>
  );
}

export default Identity;
