import React, { useMemo } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import ScreenDrawer from 'components/smart/Screen/Drawer';
import AccountRead from 'components/screens/app/Account/Read';
import AccountNone from 'components/screens/app/Account/None';
import AccountList from 'components/screens/app/Account/List';

import isNil from '@misakey/helpers/isNil';
import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerContent: {
    position: 'relative',
  },
}));

// COMPONENTS
function Account({ match, ...props }) {
  const classes = useStyles();
  const matchAccountSelected = useRouteMatch(routes.accounts._);
  const { params: { id } } = useMemo(
    () => matchAccountSelected || { params: {} },
    [matchAccountSelected],
  );
  const isNothingSelected = useMemo(() => isNil(id), [id]);

  const initialIsDrawerOpen = useMemo(
    () => isNothingSelected,
    [isNothingSelected],
  );

  return (
    <ScreenDrawer
      classes={{ content: classes.drawerContent }}
      drawerChildren={(drawerProps) => <AccountList {...drawerProps} />}
      initialIsDrawerOpen={initialIsDrawerOpen}
      {...props}
    >
      {(drawerProps) => (
        <Switch>
          <Route
            path={routes.accounts._}
            render={(renderProps) => (
              <AccountRead {...drawerProps} {...renderProps} />
            )}
          />
          <Route
            exact
            path={match.path}
            render={(renderProps) => (
              <AccountNone {...drawerProps} {...renderProps} />
            )}
          />
        </Switch>
      )}
    </ScreenDrawer>
  );
}


Account.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Account;
