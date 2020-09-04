import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import routes from 'routes';
import errorTypes from '@misakey/ui/constants/errorTypes';
import BoxesSchema from 'store/schemas/Boxes';
import { removeBox } from 'store/reducers/box';
import { removeBoxSecretKeysAndKeyShares } from '@misakey/crypto/store/actions/concrete';

import { createLeaveBoxEventBuilder } from 'helpers/builder/boxes';
import isFunction from '@misakey/helpers/isFunction';
import { getCode } from '@misakey/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useDispatch } from 'react-redux';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useHistory } from 'react-router-dom';

import DialogConfirm from '@misakey/ui/Dialog/Confirm';

// CONSTANTS
const { forbidden } = errorTypes;

// COMPONENTS
function LeaveBoxDialog({ box, t, open, onClose, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();
  const { replace } = useHistory();

  const { id, title, publicKey } = useSafeDestr(box);

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const secretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(publicKey),
    [publicKeysWeCanDecryptFrom, publicKey],
  );

  const onLeaveSuccess = useCallback(
    () => {
      const promise = isFunction(onSuccess) ? onSuccess : Promise.resolve;
      return promise()
        .then(() => Promise.all([
          dispatch(removeBox(id)),
          dispatch(removeBoxSecretKeysAndKeyShares({
            secretKeys: [secretKey],
            boxIds: [id],
          })),
        ])
          .catch(() => {
            enqueueSnackbar(t('boxes:leave.error.updateBackup'), { variant: 'error' });
          })
          .finally(() => {
            enqueueSnackbar(t('boxes:leave.success'), { variant: 'success' });
          }));
    },
    [id, secretKey, dispatch, enqueueSnackbar, onSuccess, t],
  );

  const onConfirm = useCallback(
    () => createLeaveBoxEventBuilder(id)
      .then(onLeaveSuccess)
      .catch((e) => {
        const code = getCode(e);
        if (code === forbidden) {
          enqueueSnackbar(t('boxes:leave.error.forbidden'), { variant: 'warning' });
          replace(routes.boxes._);
        } else {
          handleHttpErrors(e);
        }
      }),
    [handleHttpErrors, enqueueSnackbar, t, onLeaveSuccess, id, replace],
  );

  return (
    <DialogConfirm
      isDialogOpen={open}
      onConfirm={onConfirm}
      onClose={onClose}
      confirmButtonText={t('common:leave')}
    >
      {t('boxes:leave.dialog.description', { title })}
    </DialogConfirm>
  );
}

LeaveBoxDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

LeaveBoxDialog.defaultProps = {
  onSuccess: null,
};

export default withTranslation(['boxes', 'common'])(LeaveBoxDialog);
