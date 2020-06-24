import { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { getEncryptedSecretsBackup } from '../HttpApi';
import { decryptSecretsBackup } from '../secretsBackup/encryption';
import { CRYPTO_LOAD_SECRETS } from '../store/actions/concrete';
import { selectors } from '../store/reducer';

const useTryPassword = (encryptedSecretsBackup, dispatch) => (password) => {
  const { data, version: backupVersion } = encryptedSecretsBackup;

  return decryptSecretsBackup(data, password).then(({
    backupKey,
    secretBackup: secrets,
    // @FIXME refactor to use pattern where we import action creators to dispatch actions
  }) => dispatch({
    type: CRYPTO_LOAD_SECRETS,
    secrets,
    backupKey,
    backupVersion,
  }));
};

export default (() => {
  const [encryptedSecretsBackup, setEncryptedSecretBackup] = useState({});
  const areSecretsLoaded = useSelector(selectors.areSecretsLoaded);
  const dispatch = useDispatch();

  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const tryPassword = useTryPassword(encryptedSecretsBackup, dispatch);

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
