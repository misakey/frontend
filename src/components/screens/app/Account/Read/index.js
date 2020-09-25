import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, useParams, generatePath, useRouteMatch } from 'react-router-dom';

import routes from 'routes';
import { MISAKEY_ACCOUNT_ID } from 'constants/account';

import useIdentity from 'hooks/useIdentity';
import useAccountId from 'hooks/useAccountId';

import AccountReadPassword from 'components/screens/app/Account/Read/Password';
import AccountReadVault from 'components/screens/app/Account/Read/Vault';
import IdentityDisplayName from 'components/screens/app/Identity/DisplayName';
import IdentityNotifications from 'components/screens/app/Identity/Notifications';
import IdentityColors from 'components/screens/app/Identity/Colors';
import IdentityAvatar from 'components/screens/app/Identity/Avatar';
import AccountHome from './Home';

// COMPONENTS
function AccountRead({ toggleDrawer, isDrawerOpen }) {
  const { path } = useRouteMatch();
  const identityMetadata = useIdentity();
  const accountId = useAccountId(identityMetadata.identity);

  const { id } = useParams();

  // @FIXME to change when view of other accounts will be possible
  const shouldRedirect = useMemo(
    () => accountId !== id || id === MISAKEY_ACCOUNT_ID,
    [accountId, id],
  );

  const redirectTo = useMemo(
    () => generatePath(path, { id: accountId }),
    [accountId, path],
  );

  return (
    <Switch>
      {shouldRedirect && (
        <Redirect from={path} to={redirectTo} />
      )}
      <Route
        exact
        path={path}
        render={(routerProps) => (
          <AccountHome
            identityMetadata={identityMetadata}
            toggleDrawer={toggleDrawer}
            isDrawerOpen={isDrawerOpen}
            {...routerProps}
          />
        )}
      />
      <Route
        exact
        path={routes.accounts.password}
        render={(routerProps) => <AccountReadPassword {...routerProps} {...identityMetadata} />}
      />
      <Route
        exact
        path={routes.accounts.vault}
        render={(routerProps) => <AccountReadVault {...routerProps} {...identityMetadata} />}
      />
      <Route
        exact
        path={routes.accounts.displayName}
        render={(routerProps) => <IdentityDisplayName {...routerProps} {...identityMetadata} />}
      />
      <Route
        exact
        path={routes.accounts.notifications}
        render={(routerProps) => <IdentityNotifications {...routerProps} {...identityMetadata} />}
      />
      <Route
        exact
        path={routes.accounts.colors}
        render={(routerProps) => <IdentityColors {...routerProps} {...identityMetadata} />}
      />
      <Route
        path={routes.accounts.avatar._}
        render={(routerProps) => <IdentityAvatar {...routerProps} {...identityMetadata} />}
      />
    </Switch>
  );
}

AccountRead.propTypes = {
  // DRAWER
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
};

AccountRead.defaultProps = {
  isDrawerOpen: false,
};

export default AccountRead;
