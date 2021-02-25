import React, { useMemo } from 'react';

import { Switch, Route, useRouteMatch } from 'react-router-dom';
import routes from 'routes';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';
import { useSelector } from 'react-redux';
import useOrgId from 'hooks/useOrgId';

import RouteAcr from '@misakey/react-auth/components/Route/Acr';
import RouteAuthenticated from '@misakey/react-auth/components/Route/Authenticated';
import BoxesContextProvider from 'components/smart/Context/Boxes';
import ScreenDrawerContextProvider from 'components/smart/Screen/Drawer';
import BoxesList from 'components/screens/app/Boxes/List';
import VaultLockedScreen from 'components/screens/app/VaultLocked';
import VaultDocuments from 'components/screens/app/Documents';
import MisakeyNotifications from 'components/screens/app/Notifications';
import Boxes from 'components/screens/app/Boxes';

// HOOKS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
function Home() {
  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  const orgId = useOrgId();

  const matchNothingSelected = useRouteMatch({ path: routes.boxes._, exact: true });

  const isNothingSelected = useMemo(() => !isNil(matchNothingSelected), [matchNothingSelected]);

  const isFullWidth = useMemo(
    () => shouldDisplayLockedScreen || isNothingSelected,
    [shouldDisplayLockedScreen, isNothingSelected],
  );

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const drawerChildren = useMemo(
    () => {
      if (!isAuthenticated) {
        return null;
      }
      return shouldDisplayLockedScreen
        ? <VaultLockedScreen />
        : <BoxesList filterId={orgId} isFullWidth={isFullWidth} />;
    },
    [isAuthenticated, isFullWidth, shouldDisplayLockedScreen, orgId],
  );

  return (
    <ScreenDrawerContextProvider
      drawerChildren={drawerChildren}
      isFullWidth={isFullWidth}
      initialIsDrawerOpen={isNothingSelected}
    >
      <BoxesContextProvider>
        <Switch>
          <RouteAcr
            acr={2}
            options={{ prompt: 'login' }}
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
