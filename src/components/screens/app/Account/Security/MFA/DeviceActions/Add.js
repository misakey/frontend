import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RegisterDeviceDialog from 'components/screens/app/Account/Security/MFA/Dialog/RegisterDevice';

import { beginWebauthnRegistration, finishWebauthnRegistration } from '@misakey/auth/builder/identities';
import encodeBuffer from '@misakey/helpers/encodeBuffer';
import decodeBuffer from '@misakey/helpers/decodeBuffer';
import isNil from '@misakey/helpers/isNil';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import { addWebauthnDevice } from 'store/reducers/identity/webauthnDevices';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

// COMPONENTS
const AccountMFADeviceActionAdd = ({ identityId }) => {
  const { t } = useTranslation('account');
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [pendingDeviceCredential, setPendingDeviceCredential] = useState(null);
  const [isRegisterDeviceDialogOpened, setIsRegisterDeviceDialogOpened] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const onCloseRegisterDeviceDialog = useCallback(
    () => {
      setIsRegisterDeviceDialogOpened(false);
    },
    [],
  );

  const formatRegisterResponse = useCallback(
    ({ publicKey, ...rest }) => {
      const { challenge, user, excludeCredentials, ...publicKeyRest } = publicKey;
      const { id: userId, ...userRest } = user;

      return {
        publicKey: {
          challenge: decodeBuffer(challenge),
          user: {
            id: decodeBuffer(userId),
            ...userRest,
          },
          excludeCredentials: !isNil(excludeCredentials)
            ? excludeCredentials.map(({ id, ...credRest }) => ({
              id: decodeBuffer(id),
              ...credRest,
            }))
            : excludeCredentials,
          ...publicKeyRest,
        },
        ...rest,
      };
    },
    [],
  );

  const onDetectMFADevice = useCallback(
    async () => {
      if (!('credentials' in navigator)) { return; }
      try {
        setIsDetecting(true);
        const result = await beginWebauthnRegistration(identityId);
        const formattedResponse = formatRegisterResponse(result);
        const { id, rawId, response, type } = await navigator.credentials.create(formattedResponse);
        setPendingDeviceCredential(JSON.stringify({
          id,
          type,
          rawId: encodeBuffer(rawId),
          response: {
            attestationObject: encodeBuffer(response.attestationObject),
            clientDataJSON: encodeBuffer(response.clientDataJSON),
          },
        }));
        setIsRegisterDeviceDialogOpened(true);
      } catch (err) {
        enqueueSnackbar(t('account:security.MFA.register.error'), { variant: 'warning' });
        logSentryException(err, 'onDetectMFADevice: fail to detect Device', undefined, 'warning');
      } finally {
        setIsDetecting(false);
      }
    },
    [enqueueSnackbar, formatRegisterResponse, identityId, t],
  );

  const onAddMFADevice = useCallback(
    async (deviceName) => {
      try {
        const response = await finishWebauthnRegistration(identityId, {
          credential: pendingDeviceCredential,
          name: deviceName,
        });
        dispatch(addWebauthnDevice(identityId, response));
      } catch (error) {
        handleHttpErrors(error);
      } finally {
        setPendingDeviceCredential(null);
      }
    },
    [dispatch, handleHttpErrors, identityId, pendingDeviceCredential],
  );

  return (
    <>
      <RegisterDeviceDialog
        open={isRegisterDeviceDialogOpened}
        onSubmit={onAddMFADevice}
        onClose={onCloseRegisterDeviceDialog}
      />
      <IconButton
        edge="end"
        color="primary"
        onClick={onDetectMFADevice}
        disabled={isDetecting}
        aria-label={t('account:security.MFA.devicesList.add')}
      >
        <AddIcon />
      </IconButton>
    </>
  );
};

AccountMFADeviceActionAdd.propTypes = {
  identityId: PropTypes.string.isRequired,
};


export default AccountMFADeviceActionAdd;
