import React, { useMemo } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';
import { withTranslation } from 'react-i18next';

import ScreenDrawer from 'components/smart/Screen/Drawer';
import AccountRead from 'components/screens/app/Account/Read';
import AccountNone from 'components/screens/app/Account/None';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import BoxesList from 'components/screens/app/Boxes/List';
import DocumentList from 'components/screens/app/Documents/List';
import { ACCOUNT_LEFT_DRAWER_QUERY_PARAM } from '@misakey/ui/constants/drawers';
import { TAB_VALUES } from 'components/dumb/Tabs/DrawerMenu';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerContent: {
    position: 'relative',
  },
}));

// COMPONENTS
function Account({ match, ...props }) {
  const classes = useStyles();

  const locationSearchParams = useLocationSearchParams();

  const { [ACCOUNT_LEFT_DRAWER_QUERY_PARAM]: leftDrawer } = locationSearchParams;

  const drawerChildren = useMemo(
    () => (leftDrawer === TAB_VALUES.DOCUMENT
      ? (drawerProps) => <DocumentList {...drawerProps} />
      : (drawerProps) => <BoxesList {...drawerProps} />),
    [leftDrawer],
  );

  return (
    <ScreenDrawer
      classes={{ content: classes.drawerContent }}
      drawerChildren={drawerChildren}
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

export default withTranslation('account')(Account);
