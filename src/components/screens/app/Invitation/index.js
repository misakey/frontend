import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import routes from 'routes';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import isNil from '@misakey/helpers/isNil';

import { addBoxSecretKey } from '@misakey/crypto/store/actions/concrete';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import { getKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { computeInvitationHash, combineShares } from '@misakey/crypto/box/keySplitting';

function Invitation({ location: { hash }, t }) {
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [id, invitationShare] = useMemo(() => hash.substr(1).split('&'), [hash]);
  const redirectTo = useMemo(() => generatePath(routes.boxes.read._, { id }), [id]);

  const getKeyShareFromUrlHash = useMemo(
    () => {
      try {
        const invitationKeyShare = computeInvitationHash(invitationShare);
        return () => getKeyShareBuilder(invitationKeyShare);
      } catch (error) {
        enqueueSnackbar(t('boxes:read.errors.incorrectLink'), { variant: 'error' });
        setIsReadyToRedirect(true);
        return null;
      }
    },
    [enqueueSnackbar, invitationShare, t],
  );

  const shouldFetch = useMemo(
    () => !isReadyToRedirect && !isNil(getKeyShareFromUrlHash),
    [getKeyShareFromUrlHash, isReadyToRedirect],
  );

  const onSuccess = useCallback(
    async (misakeyKeyShare) => {
      const secretKey = combineShares(invitationShare, misakeyKeyShare);
      try {
        return await Promise.resolve(dispatch(addBoxSecretKey(secretKey)));
      } catch (error) {
        enqueueSnackbar(t('boxes:create.dialog.error.updateBackup'), { variant: 'error' });
        return Promise.resolve();
      }
    },
    [dispatch, enqueueSnackbar, invitationShare, t],
  );

  const onError = useCallback(() => {
    enqueueSnackbar(t('boxes:read.errors.incorrectLink'), { variant: 'error' });
  }, [enqueueSnackbar, t]);

  const onFinally = useCallback(() => {
    setIsReadyToRedirect(true);
  }, []);

  useFetchEffect(
    getKeyShareFromUrlHash,
    { shouldFetch },
    { onSuccess, onError, onFinally },
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

export default withTranslation(['common', 'boxes'])(Invitation);
