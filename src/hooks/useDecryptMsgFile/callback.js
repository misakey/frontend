import { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';

import decryptFileMsg from '@misakey/crypto/box/decryptFileMsg';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';
import { updateEntities } from '@misakey/store/actions/entities';
import { DecryptionError } from '@misakey/crypto/Errors/classes';

export default (secretKey) => {
  const { t } = useTranslation('common');

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
    ({ content: { encrypted, encryptedFileId } }, isFromCurrentUser) => {
      const sender = { isFromCurrentUser };
      if (canBeDecrypted) {
        const data = onDecryptFileMessage(encrypted);
        setDecryptedFileInfo(encryptedFileId, { ...data, sender });
      } else {
        setDecryptedFileInfo(encryptedFileId, { name: t('common:encrypted'), sender });
      }
    },
    [onDecryptFileMessage, setDecryptedFileInfo,
      canBeDecrypted, t],
  );
};
