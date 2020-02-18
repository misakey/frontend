// Redux Hooks

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import {
  loadSecretsBackup,
  setBackupKey,
} from './actions';

import { generateNewSaltedSymmetricKey } from '../crypto';
import { encryptSecretsBackup } from '../BackupEncryption';

export function usePreparePasswordChange() {
  const dispatch = useDispatch();

  return useCallback(
    async (newPassword, oldPassword) => {
      // if secrets are already loaded,
      // this action will not act on the store
      // and simply return data it read from it
      const { secrets } = await dispatch(loadSecretsBackup(oldPassword));

      const newBackupKey = await generateNewSaltedSymmetricKey(newPassword);
      const newEncryptedSecretsBackup = encryptSecretsBackup(secrets, newBackupKey);

      async function commitPasswordChange() {
        return dispatch(setBackupKey(newBackupKey));
      }

      return {
        backupData: newEncryptedSecretsBackup,
        commitPasswordChange,
      };
    },
    [dispatch],
  );
}
