import { useSelector } from 'react-redux';

import compact from '@misakey/helpers/compact';

import {
  keyPairFromSecretKey,
} from '../crypto';

const pubkeyCache = new Map();

/**
 * Memoized public key computation
 * @param {string} secretKey
 */
function publicKeyFromSecretKey(secretKey) {
  if (!pubkeyCache.has(secretKey)) {
    const { publicKey } = keyPairFromSecretKey(secretKey);
    pubkeyCache.set(secretKey, publicKey);
  }

  return pubkeyCache.get(secretKey);
}

/**
 * This should not be imported in application code,
 * it is only exported for tests
 * @param {object} cryptoSecrets must be a list of asymetric secret keys
 */
export function publicKeysWeCanDecryptFrom(cryptoSecrets) {
  // "compact" removes falsey values
  const secretKeys = compact([
    // @FIXME: secretKey is not urlSafe. Cf: https://gitlab.misakey.dev/misakey/frontend/-/issues/609
    // cryptoSecrets.secretKey,
    ...cryptoSecrets.boxDecryptionKeys,
    ...cryptoSecrets.passive.secretKeys,
    ...cryptoSecrets.passive.boxDecryptionKeys,
  ]);

  return new Map(secretKeys.map(
    (secretKey) => [publicKeyFromSecretKey(secretKey), secretKey],
  ));
}

/**
 * A React hook that computes a mapping
 * from any public key we can decrypt from
 * to the corresponding secret key to use for decryption.
 *
 * It uses two layers of memoization:
 * one regarding the entire set of secret keys in the store,
 * and a second one for the individual computation of public keys.
 */
export default function usePublicKeysWeCanDecryptFrom() {
  const cryptoSecrets = useSelector((store) => store.crypto.secrets);

  // @FIXME we would like to use "useMemo"
  // but for some unknown reason it would not detect changes in cryptoSecrets,
  // probably some interferences with "useSelector"
  // return useMemo(
  //   () => publicKeysWeCanDecryptFrom(cryptoSecrets),
  //   [cryptoSecrets],
  // );
  return publicKeysWeCanDecryptFrom(cryptoSecrets);
}
