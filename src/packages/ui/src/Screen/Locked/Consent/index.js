import React from 'react';

import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSelector } from 'react-redux';
import useLoadSecretsWithPasswordSso from '@misakey/react/crypto/hooks/useLoadSecretsWithPassword/sso';

import ScreenLocked from '@misakey/ui/Screen/Locked';

// CONSTANTS
const { subjectIdentity: SUBJECT_IDENTITY_SELECTOR } = ssoSelectors;

// COMPONENTS
const ScreenLockedAuth = (props) => {
  const subjectIdentity = useSelector(SUBJECT_IDENTITY_SELECTOR);
  const { displayName, avatarUrl, identifierValue } = useSafeDestr(subjectIdentity);

  const onUnlock = useLoadSecretsWithPasswordSso();

  return (
    <ScreenLocked
      displayName={displayName}
      avatarUrl={avatarUrl}
      identifierValue={identifierValue}
      onUnlock={onUnlock}
      {...props}
    />
  );
};

export default ScreenLockedAuth;
