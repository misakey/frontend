import { useCallback, useEffect } from 'react';
import { useDispatch, batch } from 'react-redux';
import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';
import { setBackupKeyShare } from '../store/actions/concrete';

const STORAGE_KEY = 'persist:crypto';

// HOOKS
export default (localBackupKeyShare) => {
  const dispatch = useDispatch();

  const handleStorageEvent = useCallback(
    (e) => {
      const { key, isTrusted, newValue } = e;
      // fallback for IE11, Safari<10
      const trusted = isTrusted === true || isNil(isTrusted);
      if (trusted && key === STORAGE_KEY) {
        // We could maybe reload also if value is flushed but for now, if backupKeyShare in backend
        // expires and we logged in the app, secretKey is already built in the app so state is safe
        // (just not coherent with a new tab)
        if (!isNil(newValue) && isNil(localBackupKeyShare)) {
          try {
            const { backupKeyShares } = JSON.parse(newValue);
            const backupKeySharesAsObject = JSON.parse(backupKeyShares);
            // For now there should be only one key in storage, later if we handle multiaccount,
            // we could use a grouped action
            batch(() => {
              Object.entries(backupKeySharesAsObject).map(
                ([accountId, backupKeyShare]) => dispatch(
                  setBackupKeyShare({ backupKeyShare, accountId }),
                ),
              );
            });
          } catch (err) {
            log(`useWatchStorageBackupKeyShares: fail to refresh state updated in another context, ${err}`);
          }
        }
      }
    },
    [dispatch, localBackupKeyShare],
  );

  return useEffect(
    () => {
      window.addEventListener('storage', handleStorageEvent);
      return () => {
        window.removeEventListener('storage', handleStorageEvent);
      };
    },
    [handleStorageEvent],
  );
};
