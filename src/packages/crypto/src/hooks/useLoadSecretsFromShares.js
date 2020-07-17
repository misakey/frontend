import { useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isNil from '@misakey/helpers/isNil';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import { getBackupKeyShareBuilder } from '@misakey/auth/builder/backupKeyShares';
import { combineShares, computeOtherShareHash } from '@misakey/crypto/secretsBackup/shares';
import { loadSecrets } from '@misakey/crypto/store/actions/concrete';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { decryptSecretsBackupWithBackupKey } from '@misakey/crypto/secretsBackup/encryption';
import { selectors } from '../store/reducers';
import useFetchSecretBackup from './useFetchSecretBackup';


// SELECTORS
const { getBackupKey, getBackupKeyShareForAccount } = selectors;

export default (() => {
  const [notFound, setNotFound] = useState(false);
  const dispatch = useDispatch();

  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const backupKey = useSelector(getBackupKey);
  const localBackupKeyShare = useSelector((state) => getBackupKeyShareForAccount(state)(accountId));
  const { data, backupVersion, isReady } = useFetchSecretBackup();

  const shouldFetch = useMemo(
    () => isReady && isNil(backupKey) && !isNil(localBackupKeyShare),
    [backupKey, isReady, localBackupKeyShare],
  );

  const fetchBackupKeyShare = useCallback(
    () => getBackupKeyShareBuilder(computeOtherShareHash(localBackupKeyShare)),
    [localBackupKeyShare],
  );

  const onSuccess = useCallback(async (remoteBackupKeyShare) => {
    const rebuiltBackupKey = combineShares(localBackupKeyShare, remoteBackupKeyShare);
    const {
      secrets,
      backupKey: decodedBackupKey,
    } = await decryptSecretsBackupWithBackupKey(data, rebuiltBackupKey);
    return dispatch(loadSecrets({ secrets, backupKey: decodedBackupKey, backupVersion }));
  }, [backupVersion, data, dispatch, localBackupKeyShare]);

  const onError = useCallback(() => {
    setNotFound(true);
  }, []);

  const { isFetching } = useFetchEffect(
    fetchBackupKeyShare,
    { shouldFetch },
    { onSuccess, onError },
  );

  return {
    notFound: notFound || isNil(localBackupKeyShare),
    backupKey,
    isFetchingBackupKeyShare: isFetching || !isReady,
  };
});