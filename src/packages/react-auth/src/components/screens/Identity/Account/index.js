import React from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from 'routes';

import useIdentity from '@misakey/react-auth/hooks/useIdentity';

import AccountSecurity from '@misakey/react-auth/components/screens/Identity/Account/Security';
import AccountVault from '@misakey/react-auth/components/screens/Identity/Account/Vault';
import AccountDelete from '@misakey/react-auth/components/screens/Identity/Account/Delete';

// COMPONENTS
function Account(props) {
  const identityMetadata = useIdentity();

  return (
    <Switch>
      <Route
        exact
        path={routes.identities.accounts.security}
        render={(routerProps) => (
          <AccountSecurity
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
      <Route
        exact
        path={routes.identities.accounts.vault}
        render={(routerProps) => (
          <AccountVault
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
      <Route
        exact
        path={routes.identities.accounts.delete}
        render={(routerProps) => (
          <AccountDelete
            {...routerProps}
            {...identityMetadata}
            {...props}
          />
        )}
      />
    </Switch>
  );
}

export default Account;
