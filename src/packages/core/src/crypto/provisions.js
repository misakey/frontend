import {
  getCryptoProvision,
  listCryptoActions,
} from '@misakey/core/crypto/HttpApi';
import { keyPairFromSecretKey } from '@misakey/core/crypto/crypto';
import { hashShare, combineShares } from '@misakey/core/crypto/crypto/keySplitting';
import { decryptCryptoaction } from '@misakey/core/crypto/cryptoactions';

export async function processProvisionKeyShare(value, accountId) {
  const userKeyShareHash = hashShare(value);
  const {
    publicKey: provisionPublicKey,
    misakeyKeyShare,
  } = await getCryptoProvision({ userKeyShareHash });

  // combineShare still expects to receive an *object* for the misakey share
  const provisionSecretKey = combineShares(value, { misakeyShare: misakeyKeyShare });

  // checking the secret key we computed matches the provision public key
  const { publicKey: rebuiltPublicKey } = keyPairFromSecretKey(provisionSecretKey);
  if (rebuiltPublicKey !== provisionPublicKey) {
    // this is a very weird case
    // because if the invitation link was corrupted
    // we would expect the backend not to have returned a provision
    throw Error('computed provision secret key does not match public key');
  }

  const cryptoactions = await listCryptoActions({ accountId });

  const boxes = cryptoactions.reduce(
    (accumulator, cryptoaction) => {
      const {
        type,
        encryptionPublicKey,
        encrypted,
        boxId,
        encryptedBoxInvitationKeyShare,
      } = cryptoaction;

      if (type !== 'invitation' || encryptionPublicKey !== provisionPublicKey) {
        return accumulator;
      }

      const { boxSecretKey } = decryptCryptoaction(encrypted, provisionSecretKey);
      const { boxKeyShare } = decryptCryptoaction(encryptedBoxInvitationKeyShare, boxSecretKey);

      accumulator.push({
        boxId,
        secretKey: boxSecretKey,
        keyShare: boxKeyShare,
      });

      return accumulator;
    },
    [],
  );

  return boxes;
}
