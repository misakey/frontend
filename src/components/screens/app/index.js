import React, { Suspense } from 'react';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Home from 'components/screens/app/Home';
import NotFound from 'components/screens/app/NotFound';
import Invitation from 'components/screens/app/Invitation';
import Profile from 'components/screens/app/Profile';
import Redirect from '@misakey/ui/Redirect';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import AccountDrawer from 'components/smart/Drawer/Account';

const BoxesApp = () => (
  <Suspense fallback={<SplashScreen />}>
    <AccountDrawer />
    <Switch>
      {/* REDIRECT TO BOXES */}
      <Redirect
        exact
        from={routes._}
        to={routes.boxes._}
      />

      {/* OTHERS */}
      <Route path={routes.identities._} component={Profile} />
      <Route path={routes.boxes.invitation} component={Invitation} />

      {/* MAIN VIEWS WITH BOXES LIST AT LEFT */}
      <Route
        path={[
          routes.boxes._, routes.documents._, routes.userNotifications._,
        ]}
        component={Home}
      />

      {/* DEFAULT */}
      <Route component={NotFound} />
    </Switch>
  </Suspense>
);

export default BoxesApp;
