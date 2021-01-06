import { useMemo, useEffect, useState } from 'react';

import isNil from '@misakey/helpers/isNil';
import pathOr from '@misakey/helpers/pathOr';

import useModifier from '@misakey/hooks/useModifier';
import useDecryptMsgFileCallback from 'hooks/useDecryptMsgFile/callback';

// HELPERS
const decryptedFilePath = pathOr({}, ['content', 'decryptedFile']);

// HOOKS
export default (event, secretKey, isFromCurrentUser) => {
  const [isReady, setIsReady] = useState(false);

  const { encryption, name } = useModifier(decryptedFilePath, event);

  const shouldDecrypt = useMemo(() => (isNil(encryption) || isNil(name)), [encryption, name]);

  const decryptMsgFile = useDecryptMsgFileCallback(secretKey);

  useEffect(
    () => {
      if (shouldDecrypt) {
        decryptMsgFile(event, isFromCurrentUser);
      }
      setIsReady(true);

      return () => { setIsReady(false); };
    },
    [shouldDecrypt, decryptMsgFile, setIsReady, event, isFromCurrentUser],
  );
  return { isReady };
};
