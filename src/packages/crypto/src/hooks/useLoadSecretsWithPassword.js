import { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { getEncryptedSecretsBackup } from '../HttpApi';
import { decryptSecretsBackup } from '../secretsBackup/encryption';
import { loadSecrets, loadSecretsAndUpdateBackup } from '../store/actions/concrete';
import { selectors } from '../store/reducer';

const useTryPassword = (encryptedSecretsBackup, dispatch, currentBoxSecrets) => useCallback(
  (password) => {
    const { data, version: backupVersion } = encryptedSecretsBackup;

    return decryptSecretsBackup(data, password)
      .then(({ backupKey, secretBackup: secrets }) => {
        // If user has add boxes from link with vault closed, we save the keys in their backup
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
  const [encryptedSecretsBackup, setEncryptedSecretBackup] = useState({});
  const areSecretsLoaded = useSelector(selectors.areSecretsLoaded);
  const dispatch = useDispatch();

  const { accountId } = useSelector(getCurrentUserSelector) || {};
  const currentBoxSecrets = useSelector(selectors.currentBoxSecrets) || [];

  const tryPassword = useTryPassword(encryptedSecretsBackup, dispatch, currentBoxSecrets);

  const onGetEncryptedSecretsBackup = useCallback(
    () => getEncryptedSecretsBackup(accountId), [accountId],
  );
  const shouldFetch = useMemo(
    () => !areSecretsLoaded && isEmpty(encryptedSecretsBackup) && !isNil(accountId),
    [accountId, areSecretsLoaded, encryptedSecretsBackup],
  );
  const onSuccess = useCallback((result) => setEncryptedSecretBackup(result), []);

  useFetchEffect(
    onGetEncryptedSecretsBackup,
    { shouldFetch },
    { onSuccess },
  );

  return areSecretsLoaded ? () => Promise.resolve() : tryPassword;
});
