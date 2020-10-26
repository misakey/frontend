import React, { useMemo } from 'react';
import { Switch, useRouteMatch, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import routes from 'routes';
import { UUID4_REGEX } from 'constants/regex';
import { selectors } from '@misakey/crypto/store/reducers';
import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';
import { BadKeyShareFormat } from '@misakey/crypto/Errors/classes';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import path from '@misakey/helpers/path';

import useWatchStorageBackupVersion from '@misakey/crypto/hooks/useWatchStorageBackupVersion';
import useSetBoxKeyShareInUrl from '@misakey/crypto/hooks/useSetBoxKeyShareInUrl';
import { useSelector } from 'react-redux';
import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';

import VaultLockedScreen from 'components/screens/app/VaultLocked';
import BoxesList from 'components/screens/app/Boxes/List';
import ScreenDrawer from 'components/smart/Screen/Drawer';
import BoxRead from 'components/screens/app/Boxes/Read';
import BoxNone from 'components/screens/app/Boxes/None';
import RouteAcr from '@misakey/auth/components/Route/Acr';
import RouteAuthenticatedBoxRead from 'components/smart/Route/Authenticated/BoxRead';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';

import Redirect from '@misakey/ui/Redirect';
import DrawerSplashScreen from 'components/smart/Screen/Drawer/Splash';

// HELPERS
const boxIdMatchParamPath = path(['match', 'params', 'id']);

// COMPONENTS
function Boxes({ match }) {
  const location = useLocation();
  const { hash: locationHash } = location;
  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const { params: { id } } = useMemo(
    () => matchBoxSelected || { params: {} },
    [matchBoxSelected],
  );
  const isNothingSelected = useMemo(() => isNil(id), [id]);
  const { backupVersion } = useSelector(selectors.getEncryptedBackupData);

  const [storageBackupVersion] = useWatchStorageBackupVersion();

  useSetBoxKeyShareInUrl(id);

  const badKeyShareFormat = useMemo(() => {
    const keyShare = locationHash.substr(1);
    if (isEmpty(keyShare)) {
      return false;
    }
    try {
      computeInvitationHash(locationHash.substr(1));
      return false;
    } catch (error) {
      if (error instanceof BadKeyShareFormat) {
        return true;
      }
      throw error;
    }
  }, [locationHash]);

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

  if (badKeyShareFormat) {
    return (
      <ScreenDrawer
        drawerChildren={drawerChildren}
        isFullWidth={isFullWidth}
        initialIsDrawerOpen={isNothingSelected}
      >
        {(drawerProps) => (
          <PasteLinkScreen
            box={{
              /* this screen expects a box object but only uses the ID */
              id,
            }}
            currentLinkMalformed
            {...drawerProps}
          />
        )}
      </ScreenDrawer>
    );
  }

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
  );
}


Boxes.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default Boxes;
