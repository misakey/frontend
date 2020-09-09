import React, { useMemo, useCallback, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';

import isNil from '@misakey/helpers/isNil';

import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useMountEffect from '@misakey/hooks/useMountEffect';
import usePropChanged from '@misakey/hooks/usePropChanged';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useResetBoxCount from 'hooks/useResetBoxCount';

import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import withBoxDetails from 'components/smart/withBoxDetails';
import withIdentity from 'components/smart/withIdentity';
import PaginateEventsByBoxContextProvider from 'components/smart/Context/PaginateEventsByBox';
import BoxClosed from './Closed';
import BoxDetails from './Details';
import BoxEvents from './Events';
import BoxFiles from './Files';

function BoxRead({
  match,
  toggleDrawer,
  isDrawerOpen,
  drawerWidth,
  setIsDrawerForceClosed,
  box,
  isFetching,
  belongsToCurrentUser,
  identityId,
}) {
  const { lifecycle, publicKey } = useMemo(() => box, [box]);
  const shouldNotDisplayContent = useMemo(
    () => lifecycle === CLOSED && !belongsToCurrentUser,
    [belongsToCurrentUser, lifecycle],
  );

  const { params: { id: boxId } } = useSafeDestr(match);

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const secretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(publicKey),
    [publicKey, publicKeysWeCanDecryptFrom],
  );
  const canBeDecrypted = useMemo(() => !isNil(secretKey), [secretKey]);

  const displayLoadingScreen = useMemo(
    () => isFetching.box || (isFetching.keyShare && isNil(secretKey)),
    [isFetching.box, isFetching.keyShare, secretKey],
  );

  const shouldShowPasteScreen = useMemo(
    () => !isNil(publicKey) && !canBeDecrypted && !shouldNotDisplayContent,
    [canBeDecrypted, publicKey, shouldNotDisplayContent],
  );

  const [boxIdChanged, resetBoxIdChanged] = usePropChanged(boxId);

  const shouldFetch = useMemo(
    () => !isNil(boxId) && !isNil(identityId) && boxIdChanged,
    [boxId, identityId, boxIdChanged],
  );

  const resetBoxCount = useResetBoxCount();

  const onResetBoxCount = useCallback(
    () => {
      resetBoxIdChanged();
      return resetBoxCount({ boxId, identityId });
    },
    [boxId, identityId, resetBoxIdChanged, resetBoxCount],
  );

  useMountEffect(() => { onResetBoxCount(); });
  useFetchEffect(onResetBoxCount, { shouldFetch });

  useEffect(() => {
    setIsDrawerForceClosed(shouldShowPasteScreen);
  }, [isFetching.box, setIsDrawerForceClosed, shouldShowPasteScreen]);

  if (displayLoadingScreen) {
    return <SplashScreenWithTranslation />;
  }

  if (shouldNotDisplayContent) {
    return (
      <BoxClosed
        box={box}
        toggleDrawer={toggleDrawer}
        isDrawerOpen={isDrawerOpen}
        drawerWidth={drawerWidth}
        belongsToCurrentUser={belongsToCurrentUser}
      />
    );
  }

  if (shouldShowPasteScreen) {
    return (
      <PasteLinkScreen
        box={box}
        drawerWidth={drawerWidth}
        isDrawerOpen={isDrawerOpen}
      />
    );
  }

  return (
    <PaginateEventsByBoxContextProvider boxId={boxId}>
      <Switch>
        <Route
          path={routes.boxes.read.details}
          render={() => (
            <BoxDetails
              box={box}
              drawerWidth={drawerWidth}
              isDrawerOpen={isDrawerOpen}
              belongsToCurrentUser={belongsToCurrentUser}
            />
          )}
        />
        <Route
          path={routes.boxes.read.files}
          render={() => (
            <BoxFiles
              box={box}
              drawerWidth={drawerWidth}
              isDrawerOpen={isDrawerOpen}
            />
          )}
        />
        <Route
          exact
          path={match.path}
          render={() => (
            <BoxEvents
              box={box}
              toggleDrawer={toggleDrawer}
              isDrawerOpen={isDrawerOpen}
              drawerWidth={drawerWidth}
              belongsToCurrentUser={belongsToCurrentUser}
            />
          )}
        />
      </Switch>
    </PaginateEventsByBoxContextProvider>
  );
}

BoxRead.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  // withIdentity
  identityId: PropTypes.string,
  // withBoxDetails
  box: PropTypes.shape(BoxesSchema.propTypes),
  isFetching: PropTypes.shape({
    box: PropTypes.bool.isRequired,
    members: PropTypes.bool.isRequired,
    keyShare: PropTypes.bool.isRequired,
  }),
  belongsToCurrentUser: PropTypes.bool.isRequired,
  // DRAWER
  setIsDrawerForceClosed: PropTypes.func.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
  drawerWidth: PropTypes.string.isRequired,
};

BoxRead.defaultProps = {
  isDrawerOpen: false,
  identityId: null,
  isFetching: {
    box: false,
    events: false,
    members: false,
    keyShare: false,
  },
  box: null,
};

export default withBoxDetails()(withIdentity(BoxRead));
