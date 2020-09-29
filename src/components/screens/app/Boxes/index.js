import React, { useMemo } from 'react';
import { Switch, useRouteMatch, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import routes from 'routes';
import { ALL } from 'constants/app/boxes/statuses';
import { UUID4_REGEX } from 'constants/regex';
import { selectors } from '@misakey/crypto/store/reducers';

import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';

import useBackupStorageEvent from '@misakey/crypto/hooks/useBackupStorageEvent';
import { useSelector } from 'react-redux';
import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';

import VaultLockedScreen from 'components/screens/app/VaultLocked';
import BoxesList from 'components/screens/app/Boxes/List';
import ScreenDrawer from 'components/smart/Screen/Drawer';
import BoxRead from 'components/screens/app/Boxes/Read';
import BoxNone from 'components/screens/app/Boxes/None';
import RouteAcr from '@misakey/auth/components/Route/Acr';
import RouteAuthenticatedBoxRead from 'components/smart/Route/Authenticated/BoxRead';

import Redirect from '@misakey/ui/Redirect';
import DrawerSplashScreen from 'components/smart/Screen/Drawer/Splash';
import BoxesContextProvider from 'components/smart/Context/Boxes';

// HELPERS
const boxIdMatchParamPath = path(['match', 'params', 'id']);

// COMPONENTS
function Boxes({ match, isReady }) {
  const location = useLocation();
  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const { params: { id } } = useMemo(
    () => matchBoxSelected || { params: {} },
    [matchBoxSelected],
  );
  const isNothingSelected = useMemo(() => isNil(id), [id]);
  const { backupVersion } = useSelector(selectors.getEncryptedBackupData);

  const [storageBackupVersion] = useBackupStorageEvent();

  const shouldRefresh = useMemo(
    () => !isNil(backupVersion) && backupVersion <= storageBackupVersion,
    [backupVersion, storageBackupVersion],
  );

  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  const isFullWidth = useMemo(
    () => shouldDisplayLockedScreen,
    [shouldDisplayLockedScreen],
  );

  const drawerChildren = useMemo(() => {
    if (shouldDisplayLockedScreen) {
      return (drawerProps) => <VaultLockedScreen {...drawerProps} />;
    }
    return (drawerProps) => <BoxesList {...drawerProps} />;
  }, [shouldDisplayLockedScreen]);

  if (shouldRefresh) {
    return (
      <Redirect
        to={location}
        forceRefresh
        manualRedirectPlaceholder={(
          <DrawerSplashScreen />
    )}
      />
    );
  }

  return (
    <BoxesContextProvider activeStatus={ALL} isReady={isReady}>
      <Switch>
        <RouteAuthenticatedBoxRead
          path={routes.boxes.read._}
          render={(renderProps) => {
            const boxId = boxIdMatchParamPath(renderProps);
            if (!UUID4_REGEX.test(boxId)) {
              return (
                <ScreenDrawer
                  drawerChildren={drawerChildren}
                  isFullWidth={isFullWidth}
                  initialIsDrawerOpen={isNothingSelected}
                >
                  {(drawerProps) => (
                    <BoxNone {...drawerProps} {...renderProps} />
                  )}
                </ScreenDrawer>
              );
            }
            return (
              <ScreenDrawer
                drawerChildren={drawerChildren}
                isFullWidth={isFullWidth}
                initialIsDrawerOpen={isNothingSelected}
              >
                {(drawerProps) => !shouldDisplayLockedScreen && (
                  <BoxRead {...drawerProps} {...renderProps} />
                )}
              </ScreenDrawer>
            );
          }}
        />
        <RouteAcr
          acr={2}
          exact
          path={match.path}
          render={(renderProps) => (
            <ScreenDrawer
              drawerChildren={drawerChildren}
              isFullWidth={isFullWidth}
              initialIsDrawerOpen={isNothingSelected}
            >
              {(drawerProps) => (
                <BoxNone {...drawerProps} {...renderProps} />
              )}
            </ScreenDrawer>
          )}
        />
      </Switch>
    </BoxesContextProvider>
  );
}


Boxes.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default Boxes;
