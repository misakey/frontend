import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, batch } from 'react-redux';

import UploadDialog from 'components/smart/Dialog/Upload';
import workerEncryptFileForVault from '@misakey/crypto/vault/workers/encryptFile/singleton';
import ensureVaultKeyExists from '@misakey/crypto/store/actions/ensureVaultKeyExists';
import { uploadFileInVaultBuilder } from '@misakey/helpers/builder/vault';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { addSavedFile } from 'store/reducers/files/saved';

// CONSTANTS
export const BLOBS_FIELD_NAME = 'files';
export const INITIAL_VALUES = { [BLOBS_FIELD_NAME]: [] };

function VaultUploadDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const identityId = useSelector(authSelectors.identityId);

  const onSuccess = useCallback(
    (response) => {
      batch(() => { response.forEach((item) => dispatch(addSavedFile(identityId, item))); });
    },
    [dispatch, identityId],
  );

  const onEncryptBuilder = useCallback(
    async (file) => {
      try {
        const vaultKey = await Promise.resolve(dispatch(ensureVaultKeyExists()));
        return workerEncryptFileForVault(file, vaultKey);
      } catch (err) {
        return Promise.reject();
      }
    },
    [dispatch],
  );

  const onUploadBuilder = useCallback(
    ({ encryptedMetadata, keyFingerprint, encryptedFile }, onFileProgress) => {
      const formData = new FormData();
      formData.append('encrypted_file', encryptedFile);
      formData.append('encrypted_metadata', encryptedMetadata);
      formData.append('key_fingerprint', keyFingerprint);

      return uploadFileInVaultBuilder(identityId, formData, onFileProgress);
    },
    [identityId],
  );

  return (
    <UploadDialog
      onSuccess={onSuccess}
      onUploadBuilder={onUploadBuilder}
      onEncryptBuilder={onEncryptBuilder}
      initialValues={INITIAL_VALUES}
      open={open}
      onClose={onClose}
    />
  );
}

VaultUploadDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

VaultUploadDialog.defaultProps = {
  open: false,
};

export default VaultUploadDialog;
