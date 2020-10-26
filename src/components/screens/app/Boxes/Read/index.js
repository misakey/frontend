import React, { useMemo, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import { CLOSED } from 'constants/app/boxes/statuses';

import isNil from '@misakey/helpers/isNil';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleBoxKeyShare from '@misakey/crypto/hooks/useHandleBoxKeyShare';

import BoxReadContextProvider from 'components/smart/Context/Boxes/BoxRead';
import InputBoxesUploadContext from 'components/smart/Input/Boxes/Upload/Context';
import FilePreviewContextProvider from 'components/smart/File/Preview/Context';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import useFetchBoxDetails from 'hooks/useFetchBoxDetails';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
import BoxSharing from 'components/screens/app/Boxes/Read/Sharing';
import BoxNoAccess from './NoAccess';
import BoxClosed from './Closed';
import BoxDetails from './Details';
import BoxEvents from './Events';
import BoxFiles from './Files';
import MustJoin from './MustJoin';

// COMPONENTS
function BoxRead({
  match,
  toggleDrawer,
  isDrawerOpen,
  drawerWidth,
  setIsDrawerForceClosed,
}) {
  const { params: { id: boxId } } = useSafeDestr(match);
  const { isReady, box } = useFetchBoxDetails(boxId);

  const { lifecycle, publicKey, hasAccess, title, isMember } = useMemo(() => box || {}, [box]);
  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const {
    isReady: isBoxKeyShareReady,
    secretKey,
  } = useHandleBoxKeyShare(box, isReady);

  const shouldDisplayClosedScreen = useMemo(
    () => lifecycle === CLOSED && !belongsToCurrentUser,
    [belongsToCurrentUser, lifecycle],
  );

  const displayLoadingScreen = useMemo(
    () => !isReady || !isBoxKeyShareReady,
    [isBoxKeyShareReady, isReady],
  );

  const shouldShowPasteScreen = useMemo(
    () => isNil(secretKey) && !isNil(publicKey) && isBoxKeyShareReady,
    [isBoxKeyShareReady, publicKey, secretKey],
  );

  const shouldShowNoAccessScreen = useMemo(() => hasAccess !== true, [hasAccess]);

  const shouldShowJoinScreen = useMemo(() => isMember === false, [isMember]);

  const shouldForceDrawerClose = useMemo(
    () => shouldShowPasteScreen || shouldDisplayClosedScreen
      || shouldShowNoAccessScreen || shouldShowJoinScreen,
    [shouldDisplayClosedScreen, shouldShowJoinScreen,
      shouldShowNoAccessScreen, shouldShowPasteScreen],
  );

  useEffect(
    () => {
      if (!displayLoadingScreen) {
        setIsDrawerForceClosed(shouldForceDrawerClose);
      }
    },
    [displayLoadingScreen, setIsDrawerForceClosed, shouldForceDrawerClose],
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

  if (shouldShowJoinScreen) {
    return (
      <MustJoin
        box={box}
        toggleDrawer={toggleDrawer}
        isDrawerOpen={isDrawerOpen}
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
    <BoxReadContextProvider box={box}>
      <FilePreviewContextProvider revokeOnChange={box.id}>
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
            path={routes.boxes.read.sharing}
            render={(routerProps) => (
              <BoxSharing
                box={box}
                isDrawerOpen={isDrawerOpen}
                {...routerProps}
              />
            )}
          />
          <InputBoxesUploadContext box={box}>
            <Route
              path={routes.boxes.read.files}
              render={() => (
                <BoxFiles
                  belongsToCurrentUser={belongsToCurrentUser}
                  box={box}
                  toggleDrawer={toggleDrawer}
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
          </InputBoxesUploadContext>
        </Switch>
      </FilePreviewContextProvider>
    </BoxReadContextProvider>
  );
}

BoxRead.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  // DRAWER
  setIsDrawerForceClosed: PropTypes.func.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
  drawerWidth: PropTypes.string.isRequired,
};

BoxRead.defaultProps = {
  isDrawerOpen: false,
};

export default BoxRead;
