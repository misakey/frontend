
import { generateAsymmetricKeyPair } from '@misakey/crypto/crypto';

import { splitBoxSecretKey } from './keySplitting';

export function createCryptoForNewBox() {
  const {
    secretKey: boxSecretKey,
    publicKey: boxPublicKey,
  } = generateAsymmetricKeyPair();

  const {
    invitationKeyShare,
    misakeyKeyShare,
  } = splitBoxSecretKey({ boxSecretKey, boxPublicKey });

  return {
    boxSecretKey,
    boxPublicKey,
    invitationKeyShare,
    misakeyKeyShare,
  };
}
