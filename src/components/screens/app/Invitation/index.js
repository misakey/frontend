import React, { useMemo, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import withDialogPassword from 'components/smart/Dialog/Password/with';

import { selectors } from '@misakey/crypto/store/reducer';
import { addBoxSecretKey } from '@misakey/crypto/store/actions/concrete';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import { getKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { computeInvitationHash, combineShares } from '@misakey/crypto/box/keySplitting';

function Invitation({ location: { hash }, onClick }) {
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);
  const dispatch = useDispatch();

  const [id, invitationShare] = useMemo(() => hash.substr(1).split('&'), [hash]);
  const redirectTo = useMemo(() => generatePath(routes.boxes.read._, { id }), [id]);

  const { accountId, id: identityId } = useSelector(getCurrentUserSelector) || {};
  const isCryptoLoadedSelector = useMemo(() => selectors.isCryptoLoaded, []);
  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

  const [secretKey, setSecretKey] = useState();

  // if user has a backup they must wait for backup to be loaded in order to add the new key
  // if user has no backup they can keep forward
  const isCryptoReady = useMemo(
    () => isCryptoLoaded || (!isNil(identityId) && isNil(accountId)),
    [accountId, identityId, isCryptoLoaded],
  );

  const shouldOpenVault = useMemo(
    () => !isNil(accountId) && !isCryptoLoaded, [accountId, isCryptoLoaded],
  );

  const shouldStoreSecretAndRedirect = useMemo(
    () => secretKey && !isReadyToRedirect && isCryptoReady,
    [isCryptoReady, isReadyToRedirect, secretKey],
  );

  const rebuildSecretKey = useCallback(
    async () => {
      const invitationHash = computeInvitationHash(invitationShare);
      const misakeyKeyShare = await getKeyShareBuilder(invitationHash);
      setSecretKey(combineShares(invitationShare, misakeyKeyShare));
    },
    [invitationShare],
  );

  useEffect(() => {
    if (shouldOpenVault) { onClick(); }
  }, [onClick, shouldOpenVault]);

  useEffect(
    () => {
      if (!shouldStoreSecretAndRedirect) {
        rebuildSecretKey();
      }
    },
    [shouldStoreSecretAndRedirect, rebuildSecretKey],
  );

  useEffect(
    () => {
      if (shouldStoreSecretAndRedirect) {
        dispatch(addBoxSecretKey(secretKey));
        setIsReadyToRedirect(true);
      }
    },
    [dispatch, secretKey, shouldStoreSecretAndRedirect],
  );

  if (isReadyToRedirect) {
    return <Redirect to={redirectTo} />;
  }

  return <SplashScreen />;
}

Invitation.propTypes = {
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default withDialogPassword(Invitation);
