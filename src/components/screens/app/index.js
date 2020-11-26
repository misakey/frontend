import React, { Suspense, lazy } from 'react';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import retry from '@misakey/helpers/retry';

import Home from 'components/screens/app/Home';
import Redirect from '@misakey/ui/Redirect';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import AccountDrawer from 'components/smart/Drawer/Account';

// LAZY
const Profile = lazy(() => retry(() => import('components/screens/app/Profile')));
const Invitation = lazy(() => retry(() => import('components/screens/app/Invitation')));
const NotFound = lazy(() => retry(() => import('components/screens/app/NotFound')));

// COMPONENTS
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
