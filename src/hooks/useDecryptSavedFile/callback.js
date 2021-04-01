import { useCallback } from 'react';
import { useDispatch } from 'react-redux';


import { decryptFileMetadataFromVault } from '@misakey/core/crypto/vault';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';
import { updateEntities } from '@misakey/store/actions/entities';
import { DecryptionError } from '@misakey/core/crypto/Errors/classes';

export default (vaultKey) => {
  const dispatch = useDispatch();

  const setDecryptedFileInfo = useCallback(
    (id, changes) => {
      dispatch(updateEntities([{ id, changes }], DecryptedFileSchema));
    },
    [dispatch],
  );

  return useCallback(
    ({ encryptedMetadata, encryptedFileId }) => {
      try {
        const {
          fileSize,
          fileName,
          fileType,
          encryption: fileEncryption,
        } = decryptFileMetadataFromVault(encryptedMetadata, vaultKey);

        setDecryptedFileInfo(encryptedFileId, {
          encryption: fileEncryption,
          name: fileName,
          size: fileSize,
          type: fileType,
        });
      } catch (err) {
        setDecryptedFileInfo(encryptedFileId, { error: new DecryptionError() });
      }
    },
    [setDecryptedFileInfo, vaultKey],
  );
};
