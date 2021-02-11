import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import isNil from '@misakey/helpers/isNil';
import { conflict } from '@misakey/ui/constants/errorTypes';
import { getCode } from '@misakey/helpers/apiError';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { getSecretStorage } from '../HttpApi';
import storeEncryptedSecretStorageData from '../store/actions/storeEncryptedSecretStorageData';
import { selectors } from '../store/reducers';

// CONSTANTS
const { isAuthenticated: IS_AUTH_SELECTOR, accountId: ACCOUNT_ID_SELECTOR } = authSelectors;

// HOOKS
export default (() => {
  const areSecretsLoaded = useSelector(selectors.isCryptoLoaded);
  const dispatch = useDispatch();

  const accountId = useSelector(ACCOUNT_ID_SELECTOR);
  const { data } = useSelector(selectors.getEncryptedSecretStorageData);
  const isAuthenticated = useSelector(IS_AUTH_SELECTOR);

  const shouldFetch = useMemo(
    () => !areSecretsLoaded && isNil(data) && !isNil(accountId) && isAuthenticated,
    [accountId, areSecretsLoaded, data, isAuthenticated],
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
    isReady: areSecretsLoaded || isNil(accountId) || !isNil(data),
  };
});
