import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, Link, useParams, generatePath } from 'react-router-dom';

import routes from 'routes';
import { MISAKEY_ACCOUNT_ID } from 'constants/account';

import useIdentity from 'hooks/useIdentity';
import useAccountId from 'hooks/useAccountId';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import CardIdentity from 'components/dumb/Card/Identity';
import AccountReadPassword from 'components/screens/app/Account/Read/Password';
import AccountReadVault from 'components/screens/app/Account/Read/Vault';
import IdentityDisplayName from 'components/screens/app/Identity/DisplayName';
import IdentityNotifications from 'components/screens/app/Identity/Notifications';
import IdentityColors from 'components/screens/app/Identity/Colors';
import IdentityAvatar from 'components/screens/app/Identity/Avatar';
import AvatarCurrentUser from 'components/smart/Avatar/CurrentUser';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';

import ArrowBack from '@material-ui/icons/ArrowBack';

// COMPONENTS
function AccountRead({ match: { path }, toggleDrawer, isDrawerOpen }) {
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
            <AppBarStatic>
              {!isDrawerOpen && (
                <IconButtonAppBar
                  aria-label="open drawer"
                  edge="start"
                  component={Link}
                  to={routes.boxes._}
                >
                  <ArrowBack />
                </IconButtonAppBar>
              )}
              <BoxFlexFill />
              {!isDrawerOpen && (
              <IconButtonAppBar
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer}
              >
                <AvatarCurrentUser />
              </IconButtonAppBar>
              )}
            </AppBarStatic>
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
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // DRAWER
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
};

AccountRead.defaultProps = {
  isDrawerOpen: false,
};

export default AccountRead;
