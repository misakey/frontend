import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';

import withUser from 'components/smart/withUser';

import 'components/screens/Account/index.scss';

// LAZY
const AccountHome = lazy(() => import('components/screens/Account/Home'));
const AccountName = lazy(() => import('components/screens/Account/Name'));
const AccountAvatar = lazy(() => import('components/screens/Account/Avatar'));
const AccountPassword = lazy(() => import('components/screens/Account/Password'));

// COMPONENTS
const Account = ({ profile, isFetching, error, ...props }) => (
  <Switch>
    <Route
      exact
      path={routes.account._}
      render={(routerProps) => (
        <AccountHome
          profile={profile}
          error={error}
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
          error={error}
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
          error={error}
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
          error={error}
          isFetching={isFetching}
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
  error: PropTypes.instanceOf(Error),
  // CONNECT
  // - STATE
  profile: PropTypes.shape({
    id: PropTypes.string,
  }),
};

Account.defaultProps = {
  error: null,
  profile: null,
};

export default withUser(Account);
