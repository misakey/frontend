
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { selectors } from '@misakey/crypto/store/reducers';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';


export default () => {
  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );

  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);
  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const shouldDisplayLockedScreen = useMemo(
    () => !isNil(accountId) && !isCryptoLoaded,
    [accountId, isCryptoLoaded],
  );

  return shouldDisplayLockedScreen;
};
