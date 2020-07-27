import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isNil from '@misakey/helpers/isNil';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import { decryptSecretsBackup } from '../secretsBackup/encryption';
import { loadSecrets, loadSecretsAndUpdateBackup } from '../store/actions/concrete';
import useFetchSecretBackup from './useFetchSecretBackup';
import useCreateNewBackupShares from './useCreateNewBackupShares';
import { selectors } from '../store/reducers';

export default (() => {
  const dispatch = useDispatch();
  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const encryptedSecretsBackup = useFetchSecretBackup();
  const currentBoxSecrets = useSelector(selectors.currentBoxSecrets);

  const createNewBackupKeyShares = useCreateNewBackupShares(dispatch);

  const onDecryptSuccess = useCallback(({ backupKey, secrets, backupVersion }) => {
    // Can occur when a user first log with ACR on a box and then create an account
    const shouldMerge = !currentBoxSecrets.every(
      (key) => secrets.boxDecryptionKeys.includes(key),
    );
    const loadSecretsAction = shouldMerge ? loadSecretsAndUpdateBackup : loadSecrets;
    return Promise.all([
      dispatch(loadSecretsAction({ secrets, backupKey, backupVersion })),
      createNewBackupKeyShares(backupKey, accountId),
    ]);
  }, [accountId, createNewBackupKeyShares, currentBoxSecrets, dispatch]);

  const decryptWithPassword = useCallback(
    (password) => {
      if (isNil(encryptedSecretsBackup)) {
        return Promise.resolve();
      }
      const { data, backupVersion } = encryptedSecretsBackup;

      return decryptSecretsBackup(data, password)
        .then(({ backupKey, secretBackup: secrets }) => onDecryptSuccess(
          { backupKey, secrets, backupVersion },
        ));
    },
    [encryptedSecretsBackup, onDecryptSuccess],
  );

  return decryptWithPassword;
});
