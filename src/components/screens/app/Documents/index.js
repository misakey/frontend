import React, { useMemo } from 'react';
import VaultLockedScreen from 'components/screens/app/VaultLocked';

import BoxesList from 'components/screens/app/Boxes/List';
import ScreenDrawer from 'components/smart/Screen/Drawer';
import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';
import VaultRead from 'components/screens/app/Documents/Read/Vault';

// COMPONENTS
function VaultDocuments() {
  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  const drawerChildren = useMemo(() => {
    if (shouldDisplayLockedScreen) {
      return (drawerProps) => <VaultLockedScreen {...drawerProps} />;
    }
    return (drawerProps) => <BoxesList {...drawerProps} />;
  }, [shouldDisplayLockedScreen]);

  return (
    <ScreenDrawer drawerChildren={drawerChildren} isFullWidth={shouldDisplayLockedScreen}>
      {(drawerProps) => {
        if (shouldDisplayLockedScreen) {
          return null;
        }
        return <VaultRead {...drawerProps} />;
      }}
    </ScreenDrawer>
  );
}

export default VaultDocuments;
