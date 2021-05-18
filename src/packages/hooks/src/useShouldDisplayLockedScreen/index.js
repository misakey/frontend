
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { selectors } from '@misakey/react/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

// CONSTANTS
const { hasCrypto: HAS_CRYPTO_SELECTOR } = authSelectors;

// HOOKS
export default () => {
  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );

  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);
  const hasCrypto = useSelector(HAS_CRYPTO_SELECTOR);

  const shouldDisplayLockedScreen = useMemo(
    () => hasCrypto === true && !isCryptoLoaded,
    [hasCrypto, isCryptoLoaded],
  );

  return shouldDisplayLockedScreen;
};
