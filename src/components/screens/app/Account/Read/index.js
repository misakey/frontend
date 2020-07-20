import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, useParams, generatePath } from 'react-router-dom';

import routes from 'routes';
import { MISAKEY_ACCOUNT_ID } from 'constants/account';

import useIdentity from 'hooks/useIdentity';
import useAccountId from 'hooks/useAccountId';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import MenuIcon from '@material-ui/icons/Menu';
import CardIdentity from 'components/dumb/Card/Identity';
import AccountReadPassword from 'components/screens/app/Account/Read/Password';
import IdentityDisplayName from 'components/screens/app/Identity/DisplayName';
import IdentityNotifications from 'components/screens/app/Identity/Notifications';
import IdentityAvatar from 'components/screens/app/Identity/Avatar';

// COMPONENTS
function AccountRead({ match: { path }, toggleDrawer, isDrawerOpen, drawerWidth }) {
  const identityMetadata = useIdentity();
  const accountId = useAccountId(identityMetadata.identity);

  const { id } = useParams();

  const shouldRedirect = useMemo(
    () => accountId !== id && id === MISAKEY_ACCOUNT_ID,
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
        render={() => (
          <>
            <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth} isDrawerOpen={isDrawerOpen}>
              {!isDrawerOpen && (
              <IconButtonAppBar
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer}
              >
                <MenuIcon />
              </IconButtonAppBar>
              )}
            </AppBarDrawer>
            {id && (
              <CardIdentity {...identityMetadata} />
            )}
          </>
        )}
      />
      <Route
        exact
        path={routes.accounts.password}
        render={(routerProps) => <AccountReadPassword {...routerProps} {...identityMetadata} />}
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
        path={routes.accounts.avatar._}
        render={(routerProps) => <IdentityAvatar {...routerProps} {...identityMetadata} />}
      />
    </Switch>
  );
}

AccountRead.propTypes = {
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // DRAWER
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
  drawerWidth: PropTypes.string.isRequired,
};

AccountRead.defaultProps = {
  isDrawerOpen: false,
};

export default AccountRead;
