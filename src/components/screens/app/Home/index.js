import React, { useMemo } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import routes from 'routes';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import RouteAcr from '@misakey/auth/components/Route/Acr';
import RouteAuthenticated from '@misakey/auth/components/Route/Authenticated';
import Boxes from 'components/screens/app/Boxes';
import useLoadSecretsFromShares from '@misakey/crypto/hooks/useLoadSecretsFromShares';
import withIdentity from 'components/smart/withIdentity';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import BoxesContextProvider from 'components/smart/Context/Boxes';
import ScreenDrawerContextProvider from 'components/smart/Screen/Drawer';
import { ALL } from 'constants/app/boxes/statuses';
import BoxesList from 'components/screens/app/Boxes/List';
import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';
import VaultLockedScreen from 'components/screens/app/VaultLocked';
import VaultDocuments from '../Documents';
import MisakeyNotifications from '../Notifications';

function Home({ isFetchingIdentity }) {
  const { isLoadingBackupKey, isReady } = useLoadSecretsFromShares();
  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  const matchNothingSelected = useRouteMatch({ path: routes.boxes._, exact: true });

  const isNothingSelected = useMemo(() => !isNil(matchNothingSelected), [matchNothingSelected]);

  if (isFetchingIdentity || isLoadingBackupKey) {
    return <SplashScreen />;
  }

  return (
    <ScreenDrawerContextProvider
      drawerChildren={shouldDisplayLockedScreen ? <VaultLockedScreen /> : <BoxesList />}
      isFullWidth={shouldDisplayLockedScreen}
      initialIsDrawerOpen={isNothingSelected}
    >
      <BoxesContextProvider activeStatus={ALL} isReady={isReady}>
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


Home.propTypes = {
  isFetchingIdentity: PropTypes.bool,
};

Home.defaultProps = {
  isFetchingIdentity: false,
};

export default withIdentity(Home);
