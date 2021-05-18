import { selectors } from '@misakey/react/crypto/store/reducers';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';


import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// CONSTANTS
const { subjectIdentity: SUBJECT_IDENTITY_SELECTOR } = ssoSelectors;

// HOOKS
export default () => {
  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );

  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);
  const subjectIdentity = useSelector(SUBJECT_IDENTITY_SELECTOR);

  const { hasCrypto } = useSafeDestr(subjectIdentity);

  const shouldDisplayLockedScreen = useMemo(
    () => hasCrypto === true && !isCryptoLoaded,
    [hasCrypto, isCryptoLoaded],
  );

  return shouldDisplayLockedScreen;
};
