import React, { useMemo, useCallback, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';
import { InvalidHash } from '@misakey/crypto/Errors/classes';

import isNil from '@misakey/helpers/isNil';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useMountEffect from '@misakey/hooks/useMountEffect';
import usePropChanged from '@misakey/hooks/usePropChanged';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useResetBoxCount from 'hooks/useResetBoxCount';

import PaginateEventsByBoxContextProvider from 'components/smart/Context/PaginateEventsByBox';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import withBoxDetails from 'components/smart/withBoxDetails';
import withIdentity from 'components/smart/withIdentity';
import BoxNoAccess from './NoAccess';
import BoxClosed from './Closed';
import BoxDetails from './Details';
import BoxEvents from './Events';
import BoxFiles from './Files';

// COMPONENTS
function BoxRead({
  match,
  toggleDrawer,
  isDrawerOpen,
  drawerWidth,
  setIsDrawerForceClosed,
  box,
  isFetching,
  error,
  belongsToCurrentUser,
  identityId,
}) {
  const { lifecycle, publicKey, hasAccess, title } = useMemo(() => box, [box]);
  const shouldDisplayClosedScreen = useMemo(
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

  const hasInvalidHashError = useMemo(
    () => {
      const { keyShare } = error;
      return keyShare instanceof InvalidHash;
    },
    [error],
  );


  const displayLoadingScreen = useMemo(
    () => ((isFetching.box || isNil(hasAccess)) && isNil(error.box))
      || (isFetching.keyShare && isNil(error.keyShare)),
    [isFetching.box, isFetching.keyShare, hasAccess, error.box, error.keyShare],
  );

  const shouldShowPasteScreen = useMemo(
    () => hasInvalidHashError || (!isNil(publicKey) && !canBeDecrypted),
    [canBeDecrypted, hasInvalidHashError, publicKey],
  );

  const shouldShowNoAccessScreen = useMemo(() => hasAccess !== true, [hasAccess]);

  const [boxIdChanged, resetBoxIdChanged] = usePropChanged(boxId);

  const shouldFetch = useMemo(
    () => !isNil(boxId) && !isNil(identityId) && boxIdChanged && hasAccess,
    [boxId, identityId, boxIdChanged, hasAccess],
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

  useEffect(
    () => {
      setIsDrawerForceClosed(
        shouldShowPasteScreen || shouldDisplayClosedScreen || shouldShowNoAccessScreen,
      );
    },
    [
      isFetching.box, setIsDrawerForceClosed,
      shouldDisplayClosedScreen, shouldShowNoAccessScreen, shouldShowPasteScreen,
    ],
  );

  useUpdateDocHead(title);

  if (displayLoadingScreen) {
    return <SplashScreenWithTranslation />;
  }

  if (shouldShowNoAccessScreen) {
    return (
      <BoxNoAccess
        box={box}
        toggleDrawer={toggleDrawer}
        isDrawerOpen={isDrawerOpen}
        belongsToCurrentUser={belongsToCurrentUser}
      />
    );
  }

  if (shouldDisplayClosedScreen) {
    return (
      <BoxClosed
        box={box}
        toggleDrawer={toggleDrawer}
        isDrawerOpen={isDrawerOpen}
        belongsToCurrentUser={belongsToCurrentUser}
      />
    );
  }

  if (shouldShowPasteScreen) {
    return (
      <PasteLinkScreen
        box={box}
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
  error: PropTypes.shape({
    box: PropTypes.object,
    keyShare: PropTypes.object,
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
  error: {
    box: null,
    keyShare: null,
  },
  box: null,
};

export default withBoxDetails()(withIdentity(BoxRead));
