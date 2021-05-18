import { notFound as notFoundError } from '@misakey/core/api/constants/errorTypes';
import { selectors } from '@misakey/react/crypto/store/reducers';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';
import loadSecrets from '@misakey/react/crypto/store/actions/loadSecrets';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import { getRootKeyShareFromAuthFlowBuilder } from '@misakey/core/auth/builder/rootKeyShares';
import { combineRootKeyShares, computeUserLocalShareHash } from '@misakey/core/crypto/secretStorage/rootKeyShares';
import { decryptSecretStorageWithRootKey } from '@misakey/core/crypto/secretStorage';
import { getCode } from '@misakey/core/helpers/apiError';

import { useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useFetchSecretStorageSso from '@misakey/react/crypto/hooks/useFetchSecretStorage/sso';

// CONSTANTS
const {
  subjectIdentity: SUBJECT_IDENTITY_SELECTOR,
} = ssoSelectors;

// SELECTORS
const { getRootKey, makeGetRootKeyShareForAccount } = selectors;

export default (() => {
  const [notFound, setNotFound] = useState(false);
  const dispatch = useDispatch();

  const subjectIdentity = useSelector(SUBJECT_IDENTITY_SELECTOR);
  const { accountId } = useSafeDestr(subjectIdentity);

  const isSecretStorageReady = useMemo(
    () => !isEmpty(subjectIdentity),
    [subjectIdentity],
  );

  const storedRootKey = useSelector(getRootKey);
  const getRootKeyShareForAccount = useMemo(() => makeGetRootKeyShareForAccount(), []);
  const localRootKeyShare = useSelector((state) => getRootKeyShareForAccount(state, accountId));
  const {
    data,
    isReady,
    isFetching: isFetchingSecretStorage,
  } = useFetchSecretStorageSso(isSecretStorageReady);
  const { secrets: encryptedSecretStorage } = useSafeDestr(data);

  const shouldFetch = useMemo(
    () => isReady && isNil(storedRootKey) && !isNil(localRootKeyShare) && !isNil(accountId),
    [isReady, storedRootKey, localRootKeyShare, accountId],
  );

  const fetchRootKeyShare = useCallback(
    () => getRootKeyShareFromAuthFlowBuilder(computeUserLocalShareHash(localRootKeyShare)),
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
  }, [localRootKeyShare, encryptedSecretStorage, dispatch]);

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
