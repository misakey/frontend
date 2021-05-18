import React from 'react';

import useShouldDisplayLockedScreen from '@misakey/hooks/useShouldDisplayLockedScreen';

import VaultRead from 'components/screens/app/Documents/Read/Vault';
import InputVaultUploadContext from 'components/smart/Input/Vault/Upload/Context';

// COMPONENTS
function VaultDocuments() {
  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  if (shouldDisplayLockedScreen) {
    return null;
  }

  return (
    <InputVaultUploadContext>
      <VaultRead />
    </InputVaultUploadContext>
  );
}

export default VaultDocuments;
