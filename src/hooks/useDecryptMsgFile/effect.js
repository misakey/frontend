import { useMemo, useEffect } from 'react';

import isNil from '@misakey/core/helpers/isNil';
import pathOr from '@misakey/core/helpers/pathOr';

import useModifier from '@misakey/hooks/useModifier';
import useDecryptMsgFileCallback from 'hooks/useDecryptMsgFile/callback';

// HELPERS
const decryptedFilePath = pathOr({}, ['content', 'decryptedFile']);

// HOOKS
export default (event, secretKey, isFromCurrentUser) => {
  const { encryption, error } = useModifier(decryptedFilePath, event);

  const isDecryptedFileReady = useMemo(
    // even if decryption is not successful, decryptedFile is set with an error
    () => !isNil(encryption) || !isNil(error),
    [encryption, error],
  );

  const shouldDecrypt = useMemo(
    // do not try to decrypt if secretKey is not ready and
    // do not try to decrypt if it's already done
    () => !isNil(secretKey) && !isDecryptedFileReady,
    [isDecryptedFileReady, secretKey],
  );

  const setDecryptedFile = useDecryptMsgFileCallback(secretKey);

  useEffect(
    () => {
      if (shouldDecrypt) {
        setDecryptedFile(event, isFromCurrentUser);
      }
    },
    [shouldDecrypt, event, isFromCurrentUser, setDecryptedFile],
  );

  return { isReady: isDecryptedFileReady };
};
