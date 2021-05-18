import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';
import { selectors } from '@misakey/react/crypto/store/reducers';
import { conflict } from '@misakey/core/api/constants/errorTypes';
import storeEncryptedSecretStorageData from '@misakey/react/crypto/store/actions/storeEncryptedSecretStorageData';

import isNil from '@misakey/core/helpers/isNil';
import { getCode } from '@misakey/core/helpers/apiError';
import { getSecretStorage } from '@misakey/core/crypto/HttpApi';

import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// CONSTANTS
const { hasCrypto: HAS_CRYPTO_AUTH_SELECTOR } = authSelectors;
const { subjectIdentity: SUBJECT_IDENTITY_SELECTOR } = ssoSelectors;

// HOOKS
export default ((isReady = true, loadStorage = getSecretStorage) => {
  const areSecretsLoaded = useSelector(selectors.isCryptoLoaded);
  const dispatch = useDispatch();

  const hasCryptoAuth = useSelector(HAS_CRYPTO_AUTH_SELECTOR);
  const subjectIdentity = useSelector(SUBJECT_IDENTITY_SELECTOR);
  const { hasCrypto: hasCryptoSso } = useSafeDestr(subjectIdentity);
  const { data } = useSelector(selectors.getEncryptedSecretStorageData);

  const hasCrypto = useMemo(
    () => (isNil(subjectIdentity) ? hasCryptoAuth : hasCryptoSso),
    [hasCryptoAuth, hasCryptoSso, subjectIdentity],
  );

  const shouldFetch = useMemo(
    () => isReady && !areSecretsLoaded && isNil(data) && hasCrypto === true,
    [hasCrypto, areSecretsLoaded, data, isReady],
  );

  const onSuccess = useCallback(
    (result) => {
      dispatch(storeEncryptedSecretStorageData(
        { data: result },
      ));
    },
    [dispatch],
  );

  const onError = useCallback(
    (error) => {
      if (getCode(error) === conflict) {
        // "throw new AccountNeedsMigration();" doesn't work:
        // useFetchEffect still returns an HTTP error;
        // TODO ONE DAY see why
        // But for now that fine,
        // we simply avoid a snackbar here
        // and we re-process the HTTP error in this hook (see below).
        return;
      }
      throw error;
    },
    [],
  );

  const { isFetching, error: fetchError } = useFetchEffect(
    loadStorage,
    { shouldFetch },
    { onSuccess, onError },
  );

  const accountNeedsMigration = useMemo(
    () => !isNil(fetchError) && getCode(fetchError) === conflict,
    [fetchError],
  );

  return {
    data,
    isFetching,
    accountNeedsMigration,
    isReady: areSecretsLoaded || hasCrypto === false || !isNil(data),
  };
});
