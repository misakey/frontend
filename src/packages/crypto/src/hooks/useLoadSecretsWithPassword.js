import { loadSecrets, loadSecretsAndUpdateBackup } from '@misakey/crypto/store/actions/concrete';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useBackupStorageEvent from '@misakey/crypto/hooks/useBackupStorageEvent';

import { decryptSecretsBackup } from '../secretsBackup/encryption';
import { selectors } from '../store/reducers';
import useFetchSecretBackup from './useFetchSecretBackup';
import useCreateNewBackupShares from './useCreateNewBackupShares';


// HOOKS
export default ((skipUpdate = false) => {
  const dispatch = useDispatch();

  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const encryptedSecretsBackup = useFetchSecretBackup();
  const currentBoxSecrets = useSelector(selectors.currentBoxSecrets);

  const [, onStorageEvent] = useBackupStorageEvent();

  const createNewBackupKeyShares = useCreateNewBackupShares(dispatch);

  const onDecryptSuccess = useCallback(({ backupKey, secrets, backupVersion }) => {
    // Can occur when a user first log with ACR on a box and then create an account
    const shouldMerge = !currentBoxSecrets.every(
      (key) => secrets.boxDecryptionKeys.includes(key),
    );
    const loadSecretsAction = shouldMerge ? loadSecretsAndUpdateBackup : loadSecrets;
    // do not trigger onStorageEvent when we update backup, as it's already done there
    const onStorageEventWhenNoBackupUpdate = shouldMerge ? Promise.resolve : onStorageEvent;
    return Promise.all([
      dispatch(loadSecretsAction({ secrets, backupKey, backupVersion })),
      createNewBackupKeyShares(backupKey, accountId),
      onStorageEventWhenNoBackupUpdate(backupVersion),
    ]);
  }, [accountId, createNewBackupKeyShares, currentBoxSecrets, dispatch, onStorageEvent]);

  const decryptWithPassword = useCallback(
    (password) => {
      if (isNil(encryptedSecretsBackup)) {
        return Promise.resolve();
      }
      const { data, backupVersion } = encryptedSecretsBackup;

      return decryptSecretsBackup(data, password)
        .then(({ backupKey, secretBackup: secrets }) => (skipUpdate
          ? Promise.resolve
          : onDecryptSuccess(
            { backupKey, secrets, backupVersion },
          )));
    },
    [encryptedSecretsBackup, onDecryptSuccess, skipUpdate],
  );

  return decryptWithPassword;
});
