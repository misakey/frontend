import React, { Suspense, lazy, useMemo } from 'react';


import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import retry from '@misakey/helpers/retry';

import Home from 'components/screens/app/Home';
import Redirect from '@misakey/ui/Redirect';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import AccountDrawer from 'components/smart/Drawer/Account';
import OrganizationDrawer from 'components/smart/Drawer/Organization';
import ScreenSplashOidc from '@misakey/ui/Screen/Splash/Oidc';

import useLoadSecretsFromShares from '@misakey/crypto/hooks/useLoadSecretsFromShares';
import useIdentity from 'hooks/useIdentity';
import useLoadedAnimation from '@misakey/hooks/useLoadedAnimation';

// LAZY
const Profile = lazy(() => retry(() => import('components/screens/app/Profile')));
const Invitation = lazy(() => retry(() => import('components/screens/app/Invitation')));
const NotFound = lazy(() => retry(() => import('components/screens/app/NotFound')));

// COMPONENTS
const BoxesApp = () => {
  const { isLoadingRootKey, isReady } = useLoadSecretsFromShares();
  const { isFetching, shouldFetch } = useIdentity();

  const isFetchingIdentity = useMemo(
    () => isFetching || shouldFetch,
    [isFetching, shouldFetch],
  );

  const isLoading = useMemo(
    () => isFetchingIdentity || isLoadingRootKey,
    [isFetchingIdentity, isLoadingRootKey],
  );

  const done = useMemo(
    () => isReady && !shouldFetch && !isLoading,
    [isReady, shouldFetch, isLoading],
  );

  const loadedAnimation = useLoadedAnimation(isLoading);

  if (isLoading || !loadedAnimation) {
    return <ScreenSplashOidc done={done} />;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
      <AccountDrawer />
      <OrganizationDrawer />
      <Switch>
        {/* REDIRECT TO BOXES */}
        <Redirect
          exact
          from={routes._}
          to={routes.boxes._}
        />

        {/* OTHERS */}
        <Route path={routes.identities._} component={Profile} />
        {/* @FIXME kept for retrocompatibility */}
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
};

export default BoxesApp;
