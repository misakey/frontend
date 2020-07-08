import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isNil from '@misakey/helpers/isNil';
import { decryptSecretsBackup } from '../secretsBackup/encryption';
import { loadSecrets, loadSecretsAndUpdateBackup } from '../store/actions/concrete';
import { selectors } from '../store/reducer';
import useFetchSecretBackup from './useFetchSecretBackup';

const useTryPassword = (encryptedSecretsBackup, dispatch, currentBoxSecrets) => useCallback(
  (password) => {
    if (isNil(encryptedSecretsBackup)) {
      return () => Promise.resolve();
    }
    const { data, backupVersion } = encryptedSecretsBackup;

    return decryptSecretsBackup(data, password)
      .then(({ backupKey, secretBackup: secrets }) => {
        // If user has added boxes from link with vault closed, we save the keys in their backup
        const shouldMerge = !currentBoxSecrets.every(
          (key) => secrets.boxDecryptionKeys.includes(key),
        );
        if (shouldMerge) {
          return dispatch(loadSecretsAndUpdateBackup({
            secrets: {
              ...secrets,
              boxDecryptionKeys: [...new Set(secrets.boxDecryptionKeys.concat(currentBoxSecrets))],
            },
            backupKey,
            backupVersion: backupVersion + 1,
          }));
        }
        return dispatch(loadSecrets({ secrets, backupKey, backupVersion }));
      });
  },
  [currentBoxSecrets, dispatch, encryptedSecretsBackup],
);

export default (() => {
  const dispatch = useDispatch();

  const currentBoxSecrets = useSelector(selectors.currentBoxSecrets) || [];
  const encryptedSecretsBackup = useFetchSecretBackup();

  return useTryPassword(encryptedSecretsBackup, dispatch, currentBoxSecrets);
});
