import React from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from 'routes';

import useIdentity from 'hooks/useIdentity';

import IdentityDisplayName from 'components/screens/app/Identity/DisplayName';
import IdentityNotifications from 'components/screens/app/Identity/Notifications';
import IdentityColors from 'components/screens/app/Identity/Colors';
import IdentityAvatar from 'components/screens/app/Identity/Avatar';
import IdentityPublic from 'components/screens/app/Identity/Public';
import RouteAcr from '@misakey/react-auth/components/Route/Acr';
import Accounts from 'components/screens/app/Account';

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
        path={routes.identities.accounts._}
        component={Accounts}
      />
    </Switch>
  );
}

export default Identity;
