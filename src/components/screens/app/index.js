import React, { Suspense } from 'react';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Home from 'components/screens/app/Home';
import NotFound from 'components/screens/app/NotFound';
import Invitation from 'components/screens/app/Invitation';
import Redirect from '@misakey/ui/Redirect';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';

const BoxesApp = () => (
  <Suspense fallback={<SplashScreen />}>
    <Switch>
      {/* REDIRECT TO BOXES */}
      <Redirect
        exact
        from={routes._}
        to={routes.boxes._}
      />

      {/* OTHERS */}
      <Route
        path={[
          routes.boxes._, routes.identities._, routes.documents._,
        ]}
        component={Home}
      />
      <Route path={routes.boxes.invitation} component={Invitation} />

      {/* DEFAULT */}
      <Route component={NotFound} />
    </Switch>
  </Suspense>
);

export default BoxesApp;
