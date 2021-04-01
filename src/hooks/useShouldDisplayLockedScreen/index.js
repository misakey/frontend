
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { selectors } from '@misakey/react/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';

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
