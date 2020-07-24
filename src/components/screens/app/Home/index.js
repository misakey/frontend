import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';

import RouteAcr from '@misakey/auth/components/Route/Acr';
import Boxes from 'components/screens/app/Boxes';
import Accounts from 'components/screens/app/Account';
import AccountDrawer from 'components/smart/Drawer/Account';

function Home() {
  return (
    <>
      <AccountDrawer />
      <Switch>
        <RouteAcr
          acr={2}
          path={routes.accounts._}
          component={Accounts}
        />
        <Route
          path={routes.boxes._}
          component={Boxes}
        />
      </Switch>
    </>
  );
}

export default Home;
