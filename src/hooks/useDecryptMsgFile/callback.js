import { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import isNil from '@misakey/core/helpers/isNil';
import prop from '@misakey/core/helpers/prop';

import decryptFileMsg from '@misakey/core/crypto/box/decryptFileMsg';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';
import { updateEntities } from '@misakey/store/actions/entities';
import { DecryptionError } from '@misakey/core/crypto/Errors/classes';

// HELPERS
const nameProp = prop('name');

// HOOKS
export default (secretKey) => {
  const { t } = useTranslation('common');
  const encryptedName = useMemo(
    () => t('common:encrypted'),
    [t],
  );

  const canBeDecrypted = useMemo(() => !isNil(secretKey), [secretKey]);
  const dispatch = useDispatch();

  const setDecryptedFileInfo = useCallback(
    (id, changes) => {
      dispatch(updateEntities([{ id, changes }], DecryptedFileSchema));
    },
    [dispatch],
  );

  const onDecryptFileMessage = useCallback(
    (encrypted) => {
      try {
        const { encryption: fileEncryption, fileName, fileSize, fileType } = decryptFileMsg(
          encrypted,
          secretKey,
        );
        return {
          encryption: fileEncryption,
          name: fileName,
          size: fileSize,
          type: fileType,
        };
      } catch (err) {
        return { error: new DecryptionError() };
      }
    },
    [secretKey],
  );

  return useCallback(
    ({ content: { encrypted, encryptedFileId, decryptedFile } }, isFromCurrentUser) => {
      const sender = { isFromCurrentUser };
      if (canBeDecrypted) {
        const data = onDecryptFileMessage(encrypted);
        setDecryptedFileInfo(encryptedFileId, { ...data, sender });
      } else {
        const decryptedFileName = nameProp(decryptedFile);
        if (decryptedFileName !== encryptedName) {
          setDecryptedFileInfo(encryptedFileId, { name: encryptedName, sender });
        }
      }
    },
    [
      onDecryptFileMessage, setDecryptedFileInfo,
      canBeDecrypted, encryptedName,
    ],
  );
};
