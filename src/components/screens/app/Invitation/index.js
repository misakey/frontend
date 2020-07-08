import React, { useMemo, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import routes from 'routes';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import { addBoxSecretKey } from '@misakey/crypto/store/actions/concrete';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import { getKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { computeInvitationHash, combineShares } from '@misakey/crypto/box/keySplitting';

function Invitation({ location: { hash }, t }) {
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);
  const dispatch = useDispatch();

  const [id, invitationShare] = useMemo(() => hash.substr(1).split('&'), [hash]);
  const redirectTo = useMemo(() => generatePath(routes.boxes.read._, { id }), [id]);
  const [secretKey, setSecretKey] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const shouldStoreSecretAndRedirect = useMemo(
    () => secretKey && !isReadyToRedirect,
    [isReadyToRedirect, secretKey],
  );

  const rebuildSecretKey = useCallback(
    async () => {
      const invitationHash = computeInvitationHash(invitationShare);
      const misakeyKeyShare = await getKeyShareBuilder(invitationHash);
      setSecretKey(combineShares(invitationShare, misakeyKeyShare));
    },
    [invitationShare],
  );

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
        Promise.resolve(dispatch(addBoxSecretKey(secretKey)))
          .then(() => { setIsReadyToRedirect(true); })
          .catch(() => {
            enqueueSnackbar(t('boxes:create.dialog.error.updateBackup'), { variant: 'error' });
          });
      }
    },
    [dispatch, enqueueSnackbar, secretKey, shouldStoreSecretAndRedirect, t],
  );

  if (isReadyToRedirect) {
    return <Redirect to={redirectTo} />;
  }

  return <SplashScreen />;
}

Invitation.propTypes = {
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(Invitation);
