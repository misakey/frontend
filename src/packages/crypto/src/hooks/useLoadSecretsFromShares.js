import { useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isNil from '@misakey/helpers/isNil';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import { getRootKeyShareBuilder } from '@misakey/auth/builder/rootKeyShares';
import { combineRootKeyShares, computeOtherShareHash } from '@misakey/crypto/secretStorage/rootKeyShares';
import loadSecrets from '@misakey/crypto/store/actions/loadSecrets';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { decryptSecretStorageWithRootKey } from '@misakey/crypto/secretStorage';
import { getCode } from '@misakey/helpers/apiError';
import { notFound as notFoundError } from '@misakey/ui/constants/errorTypes';
import { selectors } from '../store/reducers';
import useFetchSecretStorage from './useFetchSecretStorage';

// CONSTANTS
const {
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
  accountId: ACCOUNT_ID_SELECTOR,
} = authSelectors;

// SELECTORS
const { getRootKey, makeGetRootKeyShareForAccount } = selectors;

export default (() => {
  const [notFound, setNotFound] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const accountId = useSelector(ACCOUNT_ID_SELECTOR);

  const storedRootKey = useSelector(getRootKey);
  const getRootKeyShareForAccount = useMemo(() => makeGetRootKeyShareForAccount(), []);
  const localRootKeyShare = useSelector((state) => getRootKeyShareForAccount(state, accountId));
  const {
    data: encryptedSecretStorage,
    isReady,
    isFetching: isFetchingSecretStorage,
  } = useFetchSecretStorage();

  const shouldFetch = useMemo(
    () => isReady && isNil(storedRootKey) && !isNil(localRootKeyShare) && isAuthenticated,
    [storedRootKey, isAuthenticated, isReady, localRootKeyShare],
  );

  const fetchRootKeyShare = useCallback(
    () => getRootKeyShareBuilder(computeOtherShareHash(localRootKeyShare)),
    [localRootKeyShare],
  );

  const onSuccess = useCallback(async (remoteRootKeyShare) => {
    try {
      const rebuiltRootKey = combineRootKeyShares(localRootKeyShare, remoteRootKeyShare);
      // TODO ONE DAY allow decryptSecretStorageWithRootKey to finish
      // even if there are some errors decrypting some values,
      // and give it a callback to call in case of such non-critical errors;
      // better have a few secrets missing than the entire app unsusable.
      const secretStorage = decryptSecretStorageWithRootKey(encryptedSecretStorage, rebuiltRootKey);
      await dispatch(loadSecrets({ secretStorage }));
    } catch (error) {
      logSentryException(error, 'decrypting secret storage from shares', { crypto: true });
    }
  }, [encryptedSecretStorage, dispatch, localRootKeyShare]);

  const onError = useCallback(
    (error) => {
      const errorCode = getCode(error);
      const isNotFound = errorCode === notFoundError;
      // notFoundError is normal: backend key shares expires regularly
      logSentryException(error, 'fetching root key share', { crypto: true }, isNotFound ? 'info' : 'error');
      // even if it's another error than notFound, best thing to do
      // for user is to ask the password to open the app
      setNotFound(true);
    },
    [],
  );

  const { isFetching } = useFetchEffect(
    fetchRootKeyShare,
    { shouldFetch },
    { onSuccess, onError },
  );

  return {
    notFound: notFound || isNil(localRootKeyShare),
    rootKey: storedRootKey,
    isReady: isReady || false,
    isLoadingRootKey: isFetching || isFetchingSecretStorage || (shouldFetch && !notFound),
  };
});
