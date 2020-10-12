import isNil from '@misakey/helpers/isNil';
import setStorageBackupVersion, { STORAGE_KEY } from '@misakey/crypto/helpers/setStorageBackupVersion';

import { useState, useCallback, useEffect } from 'react';

// HOOKS
export default () => {
  // NB: state is not initialized with storage value, as we only want to handle update situations
  const [lastLoadedBackupVersion, setLastLoadedBackupVersion] = useState();

  const onStorageEvent = useCallback(
    (backupVersion) => {
      if (!isNil(backupVersion) && backupVersion !== lastLoadedBackupVersion) {
        return setStorageBackupVersion(backupVersion);
      }
      return Promise.resolve();
    },
    [lastLoadedBackupVersion],
  );

  const handleStorageEvent = useCallback(
    (e) => {
      const { key, isTrusted, newValue } = e;
      // fallback for IE11, Safari<10
      const trusted = isTrusted === true || isNil(isTrusted);
      if (trusted && key === STORAGE_KEY) {
        setLastLoadedBackupVersion(parseInt(newValue, 10));
      }
    },
    [],
  );

  useEffect(
    () => {
      window.addEventListener('storage', handleStorageEvent);
      return () => {
        window.removeEventListener('storage', handleStorageEvent);
      };
    },
    [handleStorageEvent],
  );

  return [lastLoadedBackupVersion, onStorageEvent];
};
