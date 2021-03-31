import React, { useCallback } from 'react';

import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import UploadDialog from 'components/smart/Dialog/Upload';
import { makeAbortableCreateBoxEncryptedFileWithProgress } from '@misakey/api/helpers/builder/boxes';
import workerEncryptFile from '@misakey/crypto/box/encryptFile/worker';

// CONSTANTS
export const BLOBS_FIELD_NAME = 'files';
export const INITIAL_VALUES = { [BLOBS_FIELD_NAME]: [] };
export const INITIAL_STATUS = { [BLOBS_FIELD_NAME]: null };

// COMPONENTS
function BoxesUploadDialog({
  initialValues,
  initialStatus,
  box,
  onSuccess,
  open,
  onClose,
  autoFocus,
}) {
  const { id, publicKey } = useSafeDestr(box);

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

  return (
    <UploadDialog
      onSuccess={onSuccess}
      onUploadBuilder={onUploadBuilder}
      onEncryptBuilder={onEncryptBuilder}
      initialValues={initialValues}
      initialStatus={initialStatus}
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
  initialStatus: PropTypes.object,
  autoFocus: PropTypes.bool,
};

BoxesUploadDialog.defaultProps = {
  open: false,
  initialValues: INITIAL_VALUES,
  initialStatus: INITIAL_STATUS,
  autoFocus: false,
  onSuccess: null,
};

export default BoxesUploadDialog;
