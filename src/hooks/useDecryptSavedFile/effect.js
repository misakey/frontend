import { useEffect } from 'react';

import isNil from '@misakey/helpers/isNil';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useDecryptSavedFileCallback from 'hooks/useDecryptSavedFile/callback';

export default (savedFile, vaultKey) => {
  const { decryptedFile } = useSafeDestr(savedFile);
  const { encryption, name } = useSafeDestr(decryptedFile);

  const decryptSavedFile = useDecryptSavedFileCallback(vaultKey);

  return useEffect(
    () => {
      if (isNil(encryption)) {
        decryptSavedFile(savedFile);
      }
    },
    [encryption, name, savedFile, vaultKey, decryptSavedFile],
  );
};
