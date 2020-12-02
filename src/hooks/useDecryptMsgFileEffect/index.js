import { useMemo, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';

import decryptFileMsg from '@misakey/crypto/box/decryptFileMsg';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';
import { updateEntities } from '@misakey/store/actions/entities';
import { DecryptionError } from '@misakey/crypto/Errors/classes';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

export default (content, secretKey, isFromCurrentUser) => {
  const { t } = useTranslation('common');
  const [isReady, setIsReady] = useState(false);

  const { encrypted, encryptedFileId, decryptedFile } = useMemo(() => content, [content]);
  const { encryption, name } = useSafeDestr(decryptedFile);

  const canBeDecrypted = useMemo(() => !isNil(secretKey), [secretKey]);
  const dispatch = useDispatch();

  const shouldDecrypt = useMemo(() => (isNil(encryption) || isNil(name)), [encryption, name]);

  const setDecryptedFileInfo = useCallback(
    (changes) => {
      dispatch(updateEntities([{ id: encryptedFileId, changes }], DecryptedFileSchema));
    },
    [dispatch, encryptedFileId],
  );

  const onDecryptFileMessage = useCallback(
    () => {
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
    [encrypted, secretKey],
  );

  useEffect(
    () => {
      if (shouldDecrypt) {
        const sender = { isFromCurrentUser };
        if (canBeDecrypted) {
          const data = onDecryptFileMessage();
          setDecryptedFileInfo({ ...data, sender });
        } else {
          setDecryptedFileInfo({ name: t('common:encrypted'), sender });
        }
      }
      setIsReady(true);

      return () => { setIsReady(false); };
    },
    [onDecryptFileMessage, setDecryptedFileInfo,
      canBeDecrypted, isFromCurrentUser, shouldDecrypt, t],
  );
  return { isReady };
};
