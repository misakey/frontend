// Crypto that's specific to organizations.
// Organizations differ from regular identities in that
// they don't have a password,
// they don't store an encrypted root key in their secret storage
// (they must remember their root key instead of a password),
// and they don't have a “vault”
import {
  generateSymmetricKey,
} from '@misakey/core/crypto/crypto';
import {
  generateIdentityKeyPair,
} from '@misakey/core/crypto/cryptoactions';
import { hash } from '@misakey/core/crypto/crypto/hashing';
import {
  encryptSecretWithRootKey,
} from '@misakey/core/crypto/secretStorage';

/**
 * Creates the data for initializing the crypto of an org.
 * `accountRootKey` is what is presented to org admin as "org crypto secret",
 * with the caveat to keep it safe and not to lose it.
 * `requestPayload` is what must be send to `PUT /organizations/:id/crypto`.
 */
export function makeOrgCryptoInitData() {
  const accountRootKey = generateSymmetricKey();
  const { publicKey, secretKey } = generateIdentityKeyPair();

  const secretStorage = {
    accountRootKeyHash: hash(accountRootKey),
    asymKeys: {
      [publicKey]: {
        encryptedSecretKey: encryptSecretWithRootKey(secretKey, accountRootKey),
      },
    },
  };

  return {
    accountRootKey,
    requestPayload: {
      publicKey,
      secretStorage,
    },
  };
}
