import isNil from '@misakey/helpers/isNil';
import setStorageLoadedBackup, { STORAGE_KEY } from '@misakey/crypto/helpers/setStorageLoadedBackup';

import { useState, useCallback, useEffect } from 'react';

// HOOKS
export default () => {
  // NB: state is not initialized with storage value, as we only want to handle update situations
  const [lastStorageLoadedBackup, setLastStorageLoadedBackup] = useState();

  const dispatchStorageEvent = useCallback(
    (backupVersion) => {
      if (!isNil(backupVersion) && backupVersion !== lastStorageLoadedBackup) {
        return setStorageLoadedBackup(backupVersion);
      }
      return Promise.resolve();
    },
    [lastStorageLoadedBackup],
  );

  const handleStorageEvent = useCallback(
    (e) => {
      const { key, isTrusted, newValue } = e;
      // fallback for IE11, Safari<10
      const trusted = isTrusted === true || isNil(isTrusted);
      if (trusted && key === STORAGE_KEY) {
        setLastStorageLoadedBackup(parseInt(newValue, 10));
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

  return [lastStorageLoadedBackup, dispatchStorageEvent];
};
