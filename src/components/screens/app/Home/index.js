import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';
import PropTypes from 'prop-types';

import RouteAcr from '@misakey/auth/components/Route/Acr';
import Boxes from 'components/screens/app/Boxes';
import Profile from 'components/screens/app/Profile';
import AccountDrawer from 'components/smart/Drawer/Account';
import useLoadSecretsFromShares from '@misakey/crypto/hooks/useLoadSecretsFromShares';
import withIdentity from 'components/smart/withIdentity';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import BoxesContextProvider from 'components/smart/Context/Boxes';
import { ALL } from 'constants/app/boxes/statuses';
import VaultDocuments from '../Documents';

function Home({ isFetchingIdentity }) {
  const { isLoadingBackupKey, isReady } = useLoadSecretsFromShares();

  if (isFetchingIdentity || isLoadingBackupKey) {
    return <SplashScreen />;
  }

  return (
    <>
      <AccountDrawer />
      <BoxesContextProvider activeStatus={ALL} isReady={isReady}>
        <Switch>
          <Route
            path={routes.identities._}
            component={Profile}
          />
          <RouteAcr
            acr={2}
            exact
            path={routes.documents._}
            component={VaultDocuments}
          />
          <Route
            path={routes.boxes._}
            component={Boxes}
          />
        </Switch>
      </BoxesContextProvider>
    </>
  );
}


Home.propTypes = {
  isFetchingIdentity: PropTypes.bool,
};

Home.defaultProps = {
  isFetchingIdentity: false,
};

export default withIdentity(Home);
