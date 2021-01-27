import React from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from 'routes';

import useIdentity from 'hooks/useIdentity';

import AccountSecurity from 'components/screens/app/Account/Security';
import AccountVault from 'components/screens/app/Account/Vault';
import AccountDelete from 'components/screens/app/Account/Delete';

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
