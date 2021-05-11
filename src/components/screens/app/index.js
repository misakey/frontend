import React, { Suspense, lazy, useMemo } from 'react';


import { Route, Switch } from 'react-router-dom';
import routes from 'routes';
import authRoutes from '@misakey/react/auth/routes';

import retry from '@misakey/core/helpers/retry';

import Home from 'components/screens/app/Home';
import Redirect from '@misakey/ui/Redirect';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import AccountMenuContext from 'components/smart/Menu/Account/Context';
import ScreenSplashOidc from '@misakey/ui/Screen/Splash/Oidc';
import BoxesContextProvider from 'components/smart/Context/Boxes';

import useLoadSecretsFromShares from '@misakey/react/crypto/hooks/useLoadSecretsFromShares';
import useIdentity from '@misakey/react/auth/hooks/useIdentity';
import useLoadedAnimation from '@misakey/hooks/useLoadedAnimation';
import SetPasswordContextProvider from '@misakey/react/auth/components/Dialog/Password/Create/Context';
import useCheckAccessToOrg from 'hooks/useCheckAccessToOrg';

// LAZY
const Profile = lazy(() => retry(() => import('components/screens/app/Profile')));
const Invitation = lazy(() => retry(() => import('components/screens/app/Invitation')));
const NotFound = lazy(() => retry(() => import('components/screens/app/NotFound')));
const OrganizationsRead = lazy(() => retry(() => import('components/screens/app/Organizations/Read')));

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

  useCheckAccessToOrg();

  if (!loadedAnimation) {
    return <ScreenSplashOidc done={done} />;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
      <SetPasswordContextProvider>
        <AccountMenuContext>
          <BoxesContextProvider>
            <Switch>
              {/* REDIRECT TO BOXES */}
              <Redirect
                exact
                from={routes._}
                to={routes.boxes._}
              />

              {/* OTHERS */}
              <Route path={routes.organizations._} component={OrganizationsRead} />
              <Route path={authRoutes.identities._} component={Profile} />
              {/* @FIXME kept for retrocompatibility */}
              <Route path={routes.boxes.invitation} component={Invitation} />

              {/* MAIN VIEWS WITH BOXES LIST AT LEFT */}
              <Route
                path={[
                  routes.boxes._, routes.documents._,
                ]}
                component={Home}
              />

              {/* DEFAULT */}
              <Route component={NotFound} />
            </Switch>
          </BoxesContextProvider>
        </AccountMenuContext>
      </SetPasswordContextProvider>
    </Suspense>
  );
};

export default BoxesApp;
