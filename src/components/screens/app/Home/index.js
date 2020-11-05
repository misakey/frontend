import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';
import PropTypes from 'prop-types';

import RouteAcr from '@misakey/auth/components/Route/Acr';
import RouteAuthenticated from '@misakey/auth/components/Route/Authenticated';
import Boxes from 'components/screens/app/Boxes';
import useLoadSecretsFromShares from '@misakey/crypto/hooks/useLoadSecretsFromShares';
import withIdentity from 'components/smart/withIdentity';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import BoxesContextProvider from 'components/smart/Context/Boxes';
import { ALL } from 'constants/app/boxes/statuses';
import VaultDocuments from '../Documents';
import MisakeyNotifications from '../Notifications';

function Home({ isFetchingIdentity }) {
  const { isLoadingBackupKey, isReady } = useLoadSecretsFromShares();

  if (isFetchingIdentity || isLoadingBackupKey) {
    return <SplashScreen />;
  }

  return (
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
  );
}


Home.propTypes = {
  isFetchingIdentity: PropTypes.bool,
};

Home.defaultProps = {
  isFetchingIdentity: false,
};

export default withIdentity(Home);
