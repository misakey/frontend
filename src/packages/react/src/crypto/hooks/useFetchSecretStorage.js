import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import isNil from '@misakey/core/helpers/isNil';
import { conflict } from '@misakey/core/api/constants/errorTypes';
import { getCode } from '@misakey/core/helpers/apiError';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { getSecretStorage } from '@misakey/core/crypto/HttpApi';
import storeEncryptedSecretStorageData from '@misakey/react/crypto/store/actions/storeEncryptedSecretStorageData';
import { selectors } from '@misakey/react/crypto/store/reducers';

// CONSTANTS
const { isAuthenticated: IS_AUTH_SELECTOR, hasCrypto: HAS_CRYPTO_SELECTOR } = authSelectors;

// HOOKS
export default (() => {
  const areSecretsLoaded = useSelector(selectors.isCryptoLoaded);
  const dispatch = useDispatch();

  const hasCrypto = useSelector(HAS_CRYPTO_SELECTOR);
  const { data } = useSelector(selectors.getEncryptedSecretStorageData);
  const isAuthenticated = useSelector(IS_AUTH_SELECTOR);

  const shouldFetch = useMemo(
    () => isAuthenticated && !areSecretsLoaded && isNil(data) && hasCrypto === true,
    [hasCrypto, areSecretsLoaded, data, isAuthenticated],
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
    getSecretStorage,
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
