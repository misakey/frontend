import React, { useMemo, useCallback, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import { CLOSED } from 'constants/app/boxes/statuses';

import isNil from '@misakey/helpers/isNil';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useMountEffect from '@misakey/hooks/useMountEffect';
import usePropChanged from '@misakey/hooks/usePropChanged';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useResetBoxCount from 'hooks/useResetBoxCount';
import useHandleBoxKeyShare from '@misakey/crypto/hooks/useHandleBoxKeyShare';

import PaginateEventsByBoxContextProvider from 'components/smart/Context/PaginateEventsByBox';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import withIdentity from 'components/smart/withIdentity';
import useFetchBoxDetails from 'hooks/useFetchBoxDetails';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
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
  identityId,
}) {
  const { params: { id: boxId } } = useSafeDestr(match);
  const { isReady, box } = useFetchBoxDetails(boxId);

  const { lifecycle, publicKey, hasAccess, title } = useMemo(() => box || {}, [box]);
  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const {
    isFetching: isFetchingBoxKeyShare,
    secretKey,
  } = useHandleBoxKeyShare(box, isReady);

  const shouldDisplayClosedScreen = useMemo(
    () => lifecycle === CLOSED && !belongsToCurrentUser,
    [belongsToCurrentUser, lifecycle],
  );

  const displayLoadingScreen = useMemo(
    () => !isReady || isFetchingBoxKeyShare,
    [isFetchingBoxKeyShare, isReady],
  );

  const shouldShowPasteScreen = useMemo(
    () => isNil(secretKey) && !isNil(publicKey),
    [publicKey, secretKey],
  );

  const shouldShowNoAccessScreen = useMemo(() => hasAccess !== true, [hasAccess]);

  useEffect(
    () => {
      if (!displayLoadingScreen) {
        setIsDrawerForceClosed(
          shouldShowPasteScreen || shouldDisplayClosedScreen || shouldShowNoAccessScreen,
        );
      }
    },
    [displayLoadingScreen, setIsDrawerForceClosed,
      shouldDisplayClosedScreen, shouldShowNoAccessScreen, shouldShowPasteScreen],
  );

  useUpdateDocHead(title);

  // RESET BOX COUNT
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
      if (!displayLoadingScreen) {
        setIsDrawerForceClosed(
          shouldShowPasteScreen || shouldDisplayClosedScreen || shouldShowNoAccessScreen,
        );
      }
    },
    [
      displayLoadingScreen,
      setIsDrawerForceClosed,
      shouldDisplayClosedScreen,
      shouldShowNoAccessScreen,
      shouldShowPasteScreen,
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
  // DRAWER
  setIsDrawerForceClosed: PropTypes.func.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
  drawerWidth: PropTypes.string.isRequired,
};

BoxRead.defaultProps = {
  isDrawerOpen: false,
  identityId: null,
};

export default withIdentity(BoxRead);
