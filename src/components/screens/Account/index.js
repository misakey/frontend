import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';

import withUser from 'components/smart/withUser';

// LAZY
const AccountHome = lazy(() => import('components/screens/Account/Home'));
const AccountName = lazy(() => import('components/screens/Account/Name'));
const AccountAvatar = lazy(() => import('components/screens/Account/Avatar'));
const AccountPassword = lazy(() => import('components/screens/Account/Password'));
const AccountNotifications = lazy(() => import('components/screens/Account/Notifications'));
const ExportCrypto = lazy(() => import('components/screens/Account/ExportCrypto'));

// COMPONENTS
const Account = ({ profile, isFetching, ...props }) => (
  <Switch>
    <Route
      exact
      path={routes.account._}
      render={(routerProps) => (
        <AccountHome
          profile={profile}
          isFetching={isFetching}
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
          profile={profile}
          isFetching={isFetching}
          {...props}
          {...routerProps}
        />
      )}
    />
    <Route
      path={routes.account.profile.avatar._}
      render={(routerProps) => (
        <AccountAvatar
          profile={profile}
          isFetching={isFetching}
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
          profile={profile}
          isFetching={isFetching}
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
          profile={profile}
          isFetching={isFetching}
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
  // withUser
  isFetching: PropTypes.bool.isRequired,
  // CONNECT
  // - STATE
  profile: PropTypes.shape({
    id: PropTypes.string,
  }),
};

Account.defaultProps = {
  profile: null,
};

export default withUser(Account);
