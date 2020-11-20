import {
  encodeUTF8,
  decodeUTF8,
  encodeBase64,
  decodeBase64,
} from 'tweetnacl-util';

import {
  generateAsymmetricKeyPair,
  asymmetricEncrypt,
  asymmetricDecrypt,
} from '@misakey/crypto/crypto';

export const generateIdentityKeyPair = generateAsymmetricKeyPair;

/**
 * Encrypts data for crypto action with given public key
 * @param {JSON} data
 * @param {string} publicKey
 */
export function encryptCryptoaction(data, publicKey) {
  return encodeBase64(decodeUTF8(
    asymmetricEncrypt(decodeUTF8(JSON.stringify(data)), publicKey),
  ));
}

/**
 * @returns {JSON}
 */
export function decryptCryptoaction(encrypted, secretKey) {
  return JSON.parse(encodeUTF8(asymmetricDecrypt(
    encodeUTF8(decodeBase64(encrypted)),
    secretKey,
  )));
}
