import React from 'react';

import { getCurrentUserSelector } from '@misakey/react/auth/store/reducers/auth';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSelector } from 'react-redux';
import useLoadSecretsWithPassword from '@misakey/react/crypto/hooks/useLoadSecretsWithPassword';

import ScreenLocked from '@misakey/ui/Screen/Locked';

// COMPONENTS
const ScreenLockedAuth = (props) => {
  const currentUser = useSelector(getCurrentUserSelector);
  const { displayName, avatarUrl, identifierValue } = useSafeDestr(currentUser);

  const openVaultWithPassword = useLoadSecretsWithPassword();

  return (
    <ScreenLocked
      displayName={displayName}
      avatarUrl={avatarUrl}
      identifierValue={identifierValue}
      onUnlock={openVaultWithPassword}
      {...props}
    />
  );
};

export default ScreenLockedAuth;
