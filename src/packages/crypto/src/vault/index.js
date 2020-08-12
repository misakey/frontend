

import { decodeUTF8, encodeUTF8 } from 'tweetnacl-util';

import { serializeObjectToJson, deserializeJsonToObject } from '@misakey/crypto/helpers/serialization';
import { computeVaultKeyFingerprint } from '@misakey/crypto/crypto/fingerprint';
import { symmetricEncrypt, symmetricDecrypt } from '@misakey/crypto/crypto';

export const encryptForVault = (objectToEncrypt, vaultKey) => {
  const formattedObject = decodeUTF8(serializeObjectToJson(objectToEncrypt));
  const encryptedMetadata = symmetricEncrypt(formattedObject, vaultKey);
  const keyFingerprint = computeVaultKeyFingerprint(vaultKey);
  return {
    encryptedMetadata: serializeObjectToJson(encryptedMetadata),
    keyFingerprint,
  };
};

export const decryptFromVault = (objectToDecrypt, vaultKey) => {
  const { nonce, ciphertext } = deserializeJsonToObject(objectToDecrypt);
  return JSON.parse(encodeUTF8(symmetricDecrypt(ciphertext, nonce, vaultKey)));
};
