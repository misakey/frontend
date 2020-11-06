import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import BoxesSchema from 'store/schemas/Boxes';
import { removeEntities } from '@misakey/store/actions/entities';
import errorTypes from '@misakey/ui/constants/errorTypes';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import UploadDialog from 'components/smart/Dialog/Upload';
import { makeAbortableCreateBoxEncryptedFileWithProgress } from '@misakey/helpers/builder/boxes';
import workerEncryptFile from '@misakey/crypto/box/encryptFile/worker';

// CONSTANTS
const { conflict } = errorTypes;
export const BLOBS_FIELD_NAME = 'files';
export const INITIAL_VALUES = { [BLOBS_FIELD_NAME]: [] };

function BoxesUploadDialog({
  initialValues,
  box,
  onSuccess,
  open,
  onClose,
  autoFocus,
}) {
  const { t } = useTranslation('boxes');
  const { id, publicKey } = useSafeDestr(box);

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const onEncryptBuilder = useCallback(
    (file) => workerEncryptFile(file, publicKey),
    [publicKey],
  );

  const onUploadBuilder = useCallback(
    ({ encryptedFile, encryptedMessageContent }, onFileProgress) => {
      const formData = new FormData();
      formData.append('encrypted_file', encryptedFile);
      formData.append('msg_encrypted_content', encryptedMessageContent);
      formData.append('msg_public_key', publicKey);

      return makeAbortableCreateBoxEncryptedFileWithProgress(
        id, formData, onFileProgress,
      );
    },
    [id, publicKey],
  );

  const onError = useCallback(
    async (error) => {
      if (error.code === conflict) {
        const { details = {} } = error;
        if (details.lifecycle === conflict) {
          dispatch(removeEntities([{ id }], BoxesSchema));
          enqueueSnackbar(t('boxes:read.events.create.error.lifecycle'), { variant: 'error' });
        }
      }
      throw error;
    },
    [dispatch, enqueueSnackbar, id, t],
  );

  return (
    <UploadDialog
      onSuccess={onSuccess}
      onError={onError}
      onUploadBuilder={onUploadBuilder}
      onEncryptBuilder={onEncryptBuilder}
      initialValues={initialValues}
      open={open}
      onClose={onClose}
      autoFocus={autoFocus}
    />
  );
}

BoxesUploadDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialValues: PropTypes.object,
  autoFocus: PropTypes.bool,
};

BoxesUploadDialog.defaultProps = {
  open: false,
  initialValues: INITIAL_VALUES,
  autoFocus: false,
  onSuccess: null,
};

export default BoxesUploadDialog;
