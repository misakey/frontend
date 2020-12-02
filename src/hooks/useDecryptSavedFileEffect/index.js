import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import isNil from '@misakey/helpers/isNil';

import { decryptFileMetadataFromVault } from '@misakey/crypto/vault';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';
import { updateEntities } from '@misakey/store/actions/entities';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { DecryptionError } from '@misakey/crypto/Errors/classes';

export default (savedFile, vaultKey) => {
  const { encryptedMetadata, encryptedFileId, decryptedFile } = useSafeDestr(savedFile);
  const { encryption, name } = useSafeDestr(decryptedFile);

  const dispatch = useDispatch();

  const setDecryptedFileInfo = useCallback(
    (changes) => {
      dispatch(updateEntities([{ id: encryptedFileId, changes }], DecryptedFileSchema));
    },
    [dispatch, encryptedFileId],
  );

  return useEffect(
    () => {
      if (isNil(encryption)) {
        try {
          const {
            fileSize,
            fileName,
            fileType,
            encryption: fileEncryption,
          } = decryptFileMetadataFromVault(encryptedMetadata, vaultKey);

          setDecryptedFileInfo({
            encryption: fileEncryption,
            name: fileName,
            size: fileSize,
            type: fileType,
          });
        } catch (err) {
          setDecryptedFileInfo({ error: new DecryptionError() });
        }
      }
    },
    [encryptedMetadata, encryption, name, setDecryptedFileInfo, vaultKey],
  );
};
