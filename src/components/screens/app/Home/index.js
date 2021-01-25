import React, { useMemo, lazy } from 'react';

import { Switch, Route, useRouteMatch } from 'react-router-dom';
import routes from 'routes';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { ALL } from 'constants/app/boxes/statuses';

import isNil from '@misakey/helpers/isNil';
import retry from '@misakey/helpers/retry';

import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';
import { useSelector } from 'react-redux';

import RouteAcr from '@misakey/auth/components/Route/Acr';
import RouteAuthenticated from '@misakey/auth/components/Route/Authenticated';
import BoxesContextProvider from 'components/smart/Context/Boxes';
import ScreenDrawerContextProvider from 'components/smart/Screen/Drawer';
import BoxesList from 'components/screens/app/Boxes/List';
import VaultLockedScreen from 'components/screens/app/VaultLocked';

// LAZY
const VaultDocuments = lazy(() => retry(() => import('components/screens/app/Documents')));
const MisakeyNotifications = lazy(() => retry(() => import('components/screens/app/Notifications')));
const Boxes = lazy(() => retry(() => import('components/screens/app/Boxes')));

// HOOKS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
function Home() {
  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  const matchNothingSelected = useRouteMatch({ path: routes.boxes._, exact: true });

  const isNothingSelected = useMemo(() => !isNil(matchNothingSelected), [matchNothingSelected]);

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const drawerChildren = useMemo(
    () => {
      if (!isAuthenticated) {
        return null;
      }
      return shouldDisplayLockedScreen ? <VaultLockedScreen /> : <BoxesList />;
    },
    [isAuthenticated, shouldDisplayLockedScreen],
  );

  return (
    <ScreenDrawerContextProvider
      drawerChildren={drawerChildren}
      isFullWidth={shouldDisplayLockedScreen}
      initialIsDrawerOpen={isNothingSelected}
    >
      <BoxesContextProvider activeStatus={ALL}>
        <Switch>
          <RouteAcr
            acr={2}
            path={routes.documents._}
            component={VaultDocuments}
          />
          <RouteAuthenticated
            path={routes.userNotifications._}
            component={MisakeyNotifications}
          />
          <Route
            path={routes.boxes._}
            component={Boxes}
          />
        </Switch>
      </BoxesContextProvider>
    </ScreenDrawerContextProvider>
  );
}

export default Home;
