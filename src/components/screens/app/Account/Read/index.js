import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, useParams, generatePath } from 'react-router-dom';

import routes from 'routes';
import { MISAKEY_ACCOUNT_ID } from 'constants/account';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import MenuIcon from '@material-ui/icons/Menu';
import CardIdentity from 'components/dumb/Card/Identity';
import AccountReadPassword from 'components/screens/app/Account/Read/Password';
import useIdentity from 'hooks/useIdentity';
import useAccountId from 'hooks/useAccountId';

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
            <AppBarDrawer drawerWidth={drawerWidth}>
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
