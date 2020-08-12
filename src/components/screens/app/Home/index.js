import React, { useMemo } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from 'routes';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import RouteAcr from '@misakey/auth/components/Route/Acr';
import Boxes from 'components/screens/app/Boxes';
import Accounts from 'components/screens/app/Account';
import AccountDrawer from 'components/smart/Drawer/Account';
import useLoadSecretsFromShares from '@misakey/crypto/hooks/useLoadSecretsFromShares';
import withIdentity from 'components/smart/withIdentity';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import Documents from 'components/screens/app/Documents';

import { selectors } from '@misakey/crypto/store/reducers';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import VaultLockedScreen from 'components/screens/app/VaultLocked';

import isNil from '@misakey/helpers/isNil';

import ScreenDrawer from 'components/smart/Screen/Drawer';

function Home({ isFetchingIdentity }) {
  const { isLoadingBackupKey } = useLoadSecretsFromShares();

  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );

  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);
  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const shouldDisplayLockedScreen = useMemo(
    () => !isNil(accountId) && !isCryptoLoaded,
    [accountId, isCryptoLoaded],
  );

  if (isFetchingIdentity || isLoadingBackupKey) {
    return <SplashScreen />;
  }

  if (shouldDisplayLockedScreen) {
    return (
      <ScreenDrawer
        drawerChildren={(drawerProps) => <VaultLockedScreen {...drawerProps} />}
        isFullWidth
      />
    );
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
        <RouteAcr
          acr={2}
          path={routes.documents._}
          component={Documents}
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
