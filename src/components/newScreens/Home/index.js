import React, { useMemo } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';

import AccountList from 'components/newScreens/Account/List';
import BoxesList from 'components/newScreens/Boxes/List';
import IdentifierDrawer from 'components/newScreens/Identifiers/Drawer';
import ScreenDrawer from 'components/smart/Screen/Drawer';

import Boxes from 'components/newScreens/Boxes';
import Accounts from 'components/newScreens/Account';

function Home() {
  const drawerChildren = useMemo(
    () => ({
      account: (drawerProps) => <IdentifierDrawer {...drawerProps} />,
      default: (drawerProps) => (
        <Switch>
          <Route
            path={routes.accounts._}
            render={(renderProps) => (
              <AccountList {...drawerProps} {...renderProps} />
            )}
          />
          <Route
            path={routes.boxes._}
            render={(renderProps) => (
              <BoxesList {...drawerProps} {...renderProps} />
            )}
          />
        </Switch>
      ),
    }),
    [],
  );
  return (
    <ScreenDrawer drawerChildren={drawerChildren}>
      {(drawerProps) => (
        <Switch>
          <Route
            path={routes.accounts._}
            render={(renderProps) => (
              <Accounts {...drawerProps} {...renderProps} />
            )}
          />
          <Route
            path={routes.boxes._}
            render={(renderProps) => (
              <Boxes {...drawerProps} {...renderProps} />
            )}
          />
        </Switch>
      )}
    </ScreenDrawer>
  );
}

export default Home;
