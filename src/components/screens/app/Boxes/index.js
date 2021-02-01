import React, { useMemo } from 'react';

import { Switch, Redirect as MuiRedirect, useRouteMatch, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import routes from 'routes';
import { UUID4_REGEX } from 'constants/regex';
import { selectors } from '@misakey/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';
import { BadKeyShareFormat } from '@misakey/crypto/Errors/classes';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import path from '@misakey/helpers/path';

import useWatchStorageBackupVersion from '@misakey/crypto/hooks/useWatchStorageBackupVersion';
import useSetBoxKeyShareInUrl from '@misakey/crypto/hooks/useSetBoxKeyShareInUrl';
import { useSelector } from 'react-redux';
import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';

import Redirect from '@misakey/ui/Redirect';
import BoxRead from 'components/screens/app/Boxes/Read';
import BoxNone from 'components/screens/app/Boxes/None';
import RouteAuthenticated from '@misakey/react-auth/components/Route/Authenticated';
import RouteAcr from '@misakey/react-auth/components/Route/Acr';
import RouteAuthenticatedBoxRead from 'components/smart/Route/Authenticated/BoxRead';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import BoxEventSubmitContextProvider from 'components/smart/Box/Event/Submit/Context';

import DrawerSplashScreen from 'components/smart/Screen/Drawer/Splash';

// CONSTANTS
const {
  acr: ACR_SELECTOR,
} = authSelectors;

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
  const { backupVersion } = useSelector(selectors.getEncryptedBackupData);

  const currentAcr = useSelector(ACR_SELECTOR);

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

  if (badKeyShareFormat) {
    return (
      <PasteLinkScreen
        box={{
          /* this screen expects a box object but only uses the ID */
          id,
        }}
        currentLinkMalformed
      />
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
            return <BoxNone {...renderProps} />;
          }
          if (!shouldDisplayLockedScreen) {
            return (
              <BoxEventSubmitContextProvider>
                <BoxRead {...renderProps} />
              </BoxEventSubmitContextProvider>
            );
          }
          return null;
        }}
      />
      <RouteAuthenticated
        exact
        path={match.path}
        render={() => (
          <Switch>
            {(isNil(currentAcr) || currentAcr <= 1) && (
              <MuiRedirect
                exact
                from={match.path}
                to={routes.userNotifications._}
              />
            )}
            <RouteAcr
              acr={2}
              exact
              path={match.path}
              component={BoxNone}
            />
          </Switch>
        )}
      />
    </Switch>
  );
}


Boxes.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Boxes;
