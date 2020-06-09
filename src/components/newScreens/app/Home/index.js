import React, { useMemo } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';

import AccountList from 'components/newScreens/app/Account/List';
import BoxesList from 'components/newScreens/app/Boxes/List';
import IdentifierDrawer from 'components/newScreens/app/Identifiers/Drawer';
import ScreenDrawer from 'components/smart/Screen/Drawer';

import Boxes from 'components/newScreens/app/Boxes';
import Accounts from 'components/newScreens/app/Account';

function Home(props) {
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
    <ScreenDrawer drawerChildren={drawerChildren} {...props}>
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

Home.propTypes = {
};

Home.defaultProps = {
};

export default Home;
