import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';
import PropTypes from 'prop-types';

import RouteAcr from '@misakey/auth/components/Route/Acr';
import Boxes from 'components/screens/app/Boxes';
import Accounts from 'components/screens/app/Account';
import AccountDrawer from 'components/smart/Drawer/Account';
import useLoadSecretsFromShares from '@misakey/crypto/hooks/useLoadSecretsFromShares';
import withIdentity from 'components/smart/withIdentity';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';

function Home({ isFetchingIdentity }) {
  const { isLoadingBackupKey } = useLoadSecretsFromShares();

  if (isFetchingIdentity || isLoadingBackupKey) {
    return <SplashScreen />;
  }

  return (
    <>
      <AccountDrawer />
      <Switch>
        <RouteAcr
          acr={2}
          path={routes.accounts._}
          component={Accounts}
        />
        <Route
          path={routes.boxes._}
          component={Boxes}
        />
      </Switch>
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
