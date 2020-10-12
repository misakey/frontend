
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { selectors } from '@misakey/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

// CONSTANTS
const { accountId: ACCOUNT_ID_SELECTOR } = authSelectors;


// HOOKS
export default () => {
  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );

  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);
  const accountId = useSelector(ACCOUNT_ID_SELECTOR);

  const shouldDisplayLockedScreen = useMemo(
    () => !isNil(accountId) && !isCryptoLoaded,
    [accountId, isCryptoLoaded],
  );

  return shouldDisplayLockedScreen;
};
