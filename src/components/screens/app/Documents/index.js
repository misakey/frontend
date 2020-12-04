import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';
import VaultRead from 'components/screens/app/Documents/Read/Vault';

// COMPONENTS
function VaultDocuments() {
  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  if (shouldDisplayLockedScreen) {
    return null;
  }

  return <VaultRead />;
}

export default VaultDocuments;
