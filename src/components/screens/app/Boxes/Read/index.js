import React, { useMemo, useCallback } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';
import { useSelector } from 'react-redux';

import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import { selectors } from '@misakey/crypto/store/reducers';
import isNil from '@misakey/helpers/isNil';

import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useMountEffect from '@misakey/hooks/useMountEffect';
import usePropChanged from '@misakey/hooks/usePropChanged';
import useResetBoxCount from 'hooks/useResetBoxCount';

import PasteLinkDialog from 'components/smart/Dialog/Boxes/PasteLink';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import DialogPasswordOpenVault from 'components/smart/Dialog/Password/OpenVault';
import withBoxDetails from 'components/smart/withBoxDetails';
import withIdentity from 'components/smart/withIdentity';
import BoxClosed from './Closed';
import BoxDetails from './Details';
import BoxEvents from './Events';
import BoxFiles from './Files';

function BoxRead({
  match, toggleDrawer, isDrawerOpen, drawerWidth, box, isFetching, belongsToCurrentUser,
  identityId,
}) {
  const { lifecycle, publicKey, id: boxId } = useMemo(() => box, [box]);
  const shouldDisplayContent = useMemo(
    () => lifecycle === CLOSED && !belongsToCurrentUser,
    [belongsToCurrentUser, lifecycle],
  );

  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );

  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);
  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();
  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(publicKey);
  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const shouldShowPasteDialog = useMemo(
    () => !canBeDecrypted && (isNil(accountId) || isCryptoLoaded),
    [accountId, canBeDecrypted, isCryptoLoaded],
  );

  const shouldShowDialogPassword = useMemo(
    () => !canBeDecrypted && !isNil(accountId) && !isCryptoLoaded,
    [accountId, canBeDecrypted, isCryptoLoaded],
  );

  const showWarning = useMemo(
    () => (canBeDecrypted && !isCryptoLoaded),
    [canBeDecrypted, isCryptoLoaded],
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

  if (isFetching.box) {
    return <SplashScreenWithTranslation />;
  }

  if (shouldDisplayContent) {
    return (
      <BoxClosed
        box={box}
        toggleDrawer={toggleDrawer}
        isDrawerOpen={isDrawerOpen}
        drawerWidth={drawerWidth}
      />
    );
  }

  return (
    <>
      {shouldShowPasteDialog && (
        <PasteLinkDialog open disableBackdropClick disableEscapeKeyDown boxId={boxId} />
      )}
      {shouldShowDialogPassword && (
        <DialogPasswordOpenVault open disableBackdropClick disableEscapeKeyDown />
      )}
      <Switch>
        <Route
          path={routes.boxes.read.details}
          render={() => (
            <BoxDetails
              box={box}
              drawerWidth={drawerWidth}
              belongsToCurrentUser={belongsToCurrentUser}
            />
          )}
        />
        <Route
          path={routes.boxes.read.files}
          render={() => <BoxFiles box={box} drawerWidth={drawerWidth} />}
        />
        <Route
          exact
          path={match.path}
          render={() => (
            <BoxEvents
              box={box}
              isFetching={isFetching.events}
              toggleDrawer={toggleDrawer}
              isDrawerOpen={isDrawerOpen}
              drawerWidth={drawerWidth}
              showWarning={showWarning}
              belongsToCurrentUser={belongsToCurrentUser}
            />
          )}
        />
      </Switch>
    </>
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
    events: PropTypes.bool.isRequired,
  }),
  belongsToCurrentUser: PropTypes.bool.isRequired,
  // DRAWER
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
  },
  box: null,
};

export default withBoxDetails()(withIdentity(BoxRead));
