import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

import { getSecretStorageFromAuthFlowBuilder } from '@misakey/core/auth/builder/secretStorage';

import useFetchSecretStorage from '@misakey/react/crypto/hooks/useFetchSecretStorage';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// CONSTANTS
const { subjectIdentity: SUBJECT_IDENTITY_SELECTOR } = ssoSelectors;

// HOOKS
export default (isReady = true) => {
  const subjectIdentity = useSelector(SUBJECT_IDENTITY_SELECTOR);
  const { id: identityId } = useSafeDestr(subjectIdentity);

  const loadStorage = useCallback(
    () => getSecretStorageFromAuthFlowBuilder({ identityId }),
    [identityId],
  );

  return useFetchSecretStorage(
    isReady,
    loadStorage,
  );
};
