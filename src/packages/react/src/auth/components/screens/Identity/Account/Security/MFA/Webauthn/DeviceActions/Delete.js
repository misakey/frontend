import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import DialogConfirm from '@misakey/ui/Dialog/Confirm';
import Typography from '@material-ui/core/Typography';

import { deleteWebauthnRegistration } from '@misakey/core/auth/builder/identities';

import { DISABLED } from '@misakey/react/auth/constants/account/mfaMethod';
import { deleteWebauthnDevice } from '@misakey/react/auth/store/reducers/identity/webauthnDevices';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';

// COMPONENTS
const AccountMFADeviceActionDelete = (
  { identityId, deviceId, shouldShowConfirm, onChangeMFAMethod },
) => {
  const { t } = useTranslation(['account', 'common']);
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = useState(false);

  const onCloseConfirmDeleteDialog = useCallback(
    () => {
      setIsConfirmDeleteDialogOpened(false);
    },
    [],
  );

  const onDeleteRegisteredMFADevice = useCallback(
    async () => {
      try {
        await deleteWebauthnRegistration(identityId, deviceId);
        dispatch(deleteWebauthnDevice(identityId, deviceId));
      } catch (error) {
        handleHttpErrors(error);
        throw error;
      }
    },
    [deviceId, dispatch, handleHttpErrors, identityId],
  );

  const onConfirm = useCallback(
    async () => {
      try {
        await onChangeMFAMethod(DISABLED);
        onDeleteRegisteredMFADevice(deviceId);
      } catch (err) {
        logSentryException(err);
      }
    },
    [onChangeMFAMethod, onDeleteRegisteredMFADevice, deviceId],
  );

  const onClick = useCallback(
    () => (shouldShowConfirm
      ? setIsConfirmDeleteDialogOpened(true)
      : onDeleteRegisteredMFADevice(deviceId)),
    [deviceId, onDeleteRegisteredMFADevice, shouldShowConfirm],
  );

  return (
    <>
      <DialogConfirm
        onConfirm={onConfirm}
        open={isConfirmDeleteDialogOpened}
        onClose={onCloseConfirmDeleteDialog}
        confirmButtonText={t('common:delete')}
        title={t('account:security.MFA.webauthn.devicesList.confirmDelete.title')}
      >
        <Typography color="textSecondary">
          {t('account:security.MFA.webauthn.devicesList.confirmDelete.subtitle')}
        </Typography>
      </DialogConfirm>
      <IconButton
        onClick={onClick}
        edge="end"
        aria-label={t('common:delete')}
      >
        <DeleteIcon />
      </IconButton>

    </>
  );
};

AccountMFADeviceActionDelete.propTypes = {
  identityId: PropTypes.string.isRequired,
  deviceId: PropTypes.string.isRequired,
  shouldShowConfirm: PropTypes.bool.isRequired,
  onChangeMFAMethod: PropTypes.func.isRequired,
};

export default AccountMFADeviceActionDelete;
