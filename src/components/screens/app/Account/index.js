import React from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from 'routes';

import useIdentity from 'hooks/useIdentity';

import AccountPassword from 'components/screens/app/Account/Password';
import AccountVault from 'components/screens/app/Account/Vault';

// COMPONENTS
function Account(props) {
  const identityMetadata = useIdentity();

  return (
    <Switch>
      <Route
        exact
        path={routes.identities.accounts.password}
        render={(routerProps) => (
          <AccountPassword
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
    </Switch>
  );
}

export default Account;
