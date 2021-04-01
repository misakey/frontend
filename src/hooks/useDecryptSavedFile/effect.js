import { useEffect } from 'react';

import isNil from '@misakey/core/helpers/isNil';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useDecryptSavedFileCallback from 'hooks/useDecryptSavedFile/callback';

export default (savedFile, vaultKey) => {
  const { decryptedFile } = useSafeDestr(savedFile);
  const { encryption, name, error } = useSafeDestr(decryptedFile);

  const decryptSavedFile = useDecryptSavedFileCallback(vaultKey);

  return useEffect(
    () => {
      if (isNil(encryption) && isNil(error)) {
        decryptSavedFile(savedFile);
      }
    },
    [encryption, error, name, savedFile, vaultKey, decryptSavedFile],
  );
};
