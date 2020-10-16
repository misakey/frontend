import { useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isNil from '@misakey/helpers/isNil';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { getBackupKeyShareBuilder } from '@misakey/auth/builder/backupKeyShares';
import { combineBackupKeyShares, computeOtherShareHash } from '@misakey/crypto/secretsBackup/keySplitting';
import { loadSecrets } from '@misakey/crypto/store/actions/concrete';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { decryptSecretsBackupWithBackupKey } from '@misakey/crypto/secretsBackup/encryption';
import useWatchStorageBackupKeyShares from '@misakey/crypto/hooks/useWatchStorageBackupKeyShares';
import { selectors } from '../store/reducers';
import useFetchSecretBackup from './useFetchSecretBackup';

// CONSTANTS
const {
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
  accountId: ACCOUNT_ID_SELECTOR,
} = authSelectors;

// SELECTORS
const { getBackupKey, makeGetBackupKeyShareForAccount } = selectors;

export default (() => {
  const [notFound, setNotFound] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const accountId = useSelector(ACCOUNT_ID_SELECTOR);

  const backupKey = useSelector(getBackupKey);
  const getBackupKeyShareForAccount = useMemo(() => makeGetBackupKeyShareForAccount(), []);
  const localBackupKeyShare = useSelector((state) => getBackupKeyShareForAccount(state, accountId));
  const { data, backupVersion, isReady, isFetching: isFetchingBackup } = useFetchSecretBackup();

  const shouldFetch = useMemo(
    () => isReady && isNil(backupKey) && !isNil(localBackupKeyShare) && isAuthenticated,
    [backupKey, isAuthenticated, isReady, localBackupKeyShare],
  );

  const fetchBackupKeyShare = useCallback(
    () => getBackupKeyShareBuilder(computeOtherShareHash(localBackupKeyShare)),
    [localBackupKeyShare],
  );

  const onSuccess = useCallback(async (remoteBackupKeyShare) => {
    const rebuiltBackupKey = combineBackupKeyShares(localBackupKeyShare, remoteBackupKeyShare);
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

  // Handle multi tabs updates
  useWatchStorageBackupKeyShares(localBackupKeyShare);

  return {
    notFound: notFound || isNil(localBackupKeyShare),
    backupKey,
    isReady: isReady || false,
    isLoadingBackupKey: isFetching || isFetchingBackup || (shouldFetch && !notFound),
  };
});
