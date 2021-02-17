import React, { useMemo, useCallback } from 'react';

import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleBoxKeyShare from '@misakey/crypto/hooks/useHandleBoxKeyShare';
import { useBoxEventSubmitContext } from 'components/smart/Box/Event/Submit/Context';
import useFetchBoxDetails from 'hooks/useFetchBoxDetails';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';

import BoxReadContextProvider from 'components/smart/Context/Boxes/BoxRead';
import InputBoxesUploadContext from 'components/smart/Input/Boxes/Upload/Context';
import FilePreviewContextProvider from 'components/smart/File/Preview/Context';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import BoxSharing from 'components/screens/app/Boxes/Read/Sharing';
import BoxNoAccess from './NoAccess';
import BoxDetails from './Details';
import BoxEvents from './Events';
import BoxFiles from './Files';
import MustJoin from './MustJoin';

// COMPONENTS
function BoxRead({ match }) {
  const { params: { id: boxId } } = useSafeDestr(match);
  const { isReady, box } = useFetchBoxDetails(boxId);

  const { scrollToBottom } = useBoxEventSubmitContext();

  const { publicKey, hasAccess, title, isMember, eventsCount } = useSafeDestr(box);
  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const {
    isReady: isBoxKeyShareReady,
    secretKey,
  } = useHandleBoxKeyShare(box, isReady, belongsToCurrentUser);

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

  // @FIXME helps avoid collision with intersection observer for file preview
  const timeoutScrollToBottom = useCallback(
    () => {
      setTimeout(
        () => scrollToBottom(),
      );
    },
    [scrollToBottom],
  );

  const documentTitle = useMemo(
    () => (isNil(eventsCount) || eventsCount === 0 ? title : `(${eventsCount}) ${title}`),
    [eventsCount, title],
  );

  useUpdateDocHead(documentTitle);

  if (displayLoadingScreen) {
    return <SplashScreenWithTranslation />;
  }

  if (shouldShowNoAccessScreen) {
    return (
      <BoxNoAccess box={box} belongsToCurrentUser={belongsToCurrentUser} />
    );
  }

  if (shouldShowJoinScreen) {
    return (
      <MustJoin box={box} />
    );
  }

  if (shouldShowPasteScreen) {
    return (
      <PasteLinkScreen box={box} />
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
                belongsToCurrentUser={belongsToCurrentUser}
              />
            )}
          />
          <Route
            path={routes.boxes.read.sharing}
            render={(routerProps) => (
              <BoxSharing
                box={box}
                {...routerProps}
              />
            )}
          />
          <Route
            path={[routes.boxes.read.files, match.path]}
            render={() => (
              <InputBoxesUploadContext
                box={box}
                onSuccess={timeoutScrollToBottom}
                display="flex"
                flexDirection="column"
              >
                <Switch>
                  <Route
                    path={routes.boxes.read.files}
                    render={() => (
                      <BoxFiles
                        belongsToCurrentUser={belongsToCurrentUser}
                        box={box}
                      />
                    )}
                  />
                  <Route
                    exact
                    path={match.path}
                    render={() => (
                      <BoxEvents
                        box={box}
                        belongsToCurrentUser={belongsToCurrentUser}
                      />
                    )}
                  />
                </Switch>
              </InputBoxesUploadContext>
            )}
          />
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
};

export default BoxRead;
