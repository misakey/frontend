import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';
import IdentitySchema from 'store/schemas/Identity';

import withIdentity from 'components/smart/withIdentity';

// LAZY
const AccountHome = lazy(() => import('components/oldScreens/Account/Home'));
const AccountName = lazy(() => import('components/oldScreens/Account/Name'));
const AccountAvatar = lazy(() => import('components/oldScreens/Account/Avatar'));
const AccountPassword = lazy(() => import('components/oldScreens/Account/Password'));
const AccountNotifications = lazy(() => import('components/oldScreens/Account/Notifications'));
const ExportCrypto = lazy(() => import('components/oldScreens/Account/ExportCrypto'));

// COMPONENTS
const Account = ({ identity, isFetchingIdentity, ...props }) => (
  <Switch>
    <Route
      exact
      path={routes.account._}
      render={(routerProps) => (
        <AccountHome
          identity={identity}
          isFetching={isFetchingIdentity}
          {...props}
          {...routerProps}
        />
      )}
    />
    <Route
      exact
      path={routes.account.profile.name}
      render={(routerProps) => (
        <AccountName
          identity={identity}
          isFetching={isFetchingIdentity}
          {...props}
          {...routerProps}
        />
      )}
    />
    <Route
      path={routes.account.profile.avatar._}
      render={(routerProps) => (
        <AccountAvatar
          identity={identity}
          isFetching={isFetchingIdentity}
          {...props}
          {...routerProps}
        />
      )}
    />
    <Route
      exact
      path={routes.account.profile.password}
      render={(routerProps) => (
        <AccountPassword
          identity={identity}
          isFetching={isFetchingIdentity}
          {...props}
          {...routerProps}
        />
      )}
    />
    <Route
      exact
      path={routes.account.profile.notifications}
      render={(routerProps) => (
        <AccountNotifications
          identity={identity}
          isFetching={isFetchingIdentity}
          {...props}
          {...routerProps}
        />
      )}
    />
    <Route
      exact
      path={routes.account.exportCrypto}
      render={(routerProps) => (
        <ExportCrypto
          {...props}
          {...routerProps}
        />
      )}
    />
  </Switch>
);

Account.propTypes = {
  // withIdentity
  isFetchingIdentity: PropTypes.bool.isRequired,
  // CONNECT
  // - STATE
  identity: PropTypes.shape(IdentitySchema.propTypes),
};

Account.defaultProps = {
  identity: null,
};

export default withIdentity(Account);
