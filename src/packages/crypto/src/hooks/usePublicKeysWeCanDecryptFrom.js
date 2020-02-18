import { useMemo } from 'react';
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
 * A React hook that computes a mapping
 * from any public key we can decrypt from
 * to the corresponding secret key to use for decryption.
 *
 * It uses two layers of memoization:
 * one regarding the entire set of secret keys in the store,
 * and a second one for the individual computation of public keys.
 *
 * @param {object} cryptoSecrets part "crypto.secrets" of the Redux store
 */
export default function usePublicKeysWeCanDecryptFrom() {
  const cryptoSecrets = useSelector((store) => store.crypto.secrets);
  return useMemo(
    () => {
      // "compact" removes falsey values
      const secretKeys = compact([
        cryptoSecrets.secretKey,
      ]);

      return new Map(secretKeys.map(
        (secretKey) => [publicKeyFromSecretKey(secretKey), secretKey],
      ));
    },
    [cryptoSecrets.secretKey],
  );
}
