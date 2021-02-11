// The "user vault" is a place where the user can upload encrypted files for herself.
// In terms of usage it is somewhat similar to creating a box,
// only putting files in it (no text messages) and not inviting any one to it.
// Actually we considered implementing the vault on top of the existing “box” mechanism,
// but we ended up implementing a completely separate system.
// The vault mechanism does share something with the box mechanism, though:
// both use the same system to store "encrypted files".
// The vault, just like boxes, only store encrypted metadata
// that lets the frontend represent an encrypted file (with file name, size and type)
// and decrypt it if the user wants to download it.
// Actually, adding to the vault a file that is in a box (or vice versa)
// does not require to download the encrypted file itself:
// it suffices to download, decrypt and re-encrypt the metadata.

import { decodeUTF8, encodeUTF8 } from 'tweetnacl-util';

import { serializeObjectToJson, deserializeJsonToObject } from '@misakey/crypto/helpers/serialization';
import { computeVaultKeyFingerprint } from '@misakey/crypto/crypto/fingerprint';
import {
  symmetricEncrypt,
  symmetricDecrypt,
  generateSymmetricKey,
} from '@misakey/crypto/crypto';
import { encryptFile } from '@misakey/crypto/files';

export const generateVaultKey = generateSymmetricKey;

export const encryptFileMetadataForVault = (metadata, vaultKey) => {
  const formattedObject = decodeUTF8(serializeObjectToJson(metadata));
  const encryptedMetadata = symmetricEncrypt(formattedObject, vaultKey);
  const keyFingerprint = computeVaultKeyFingerprint(vaultKey);
  return {
    encryptedMetadata: serializeObjectToJson(encryptedMetadata),
    keyFingerprint,
  };
};

export const decryptFileMetadataFromVault = (encryptedMetadata, vaultKey) => {
  const { nonce, ciphertext } = deserializeJsonToObject(encryptedMetadata);
  return JSON.parse(encodeUTF8(symmetricDecrypt(ciphertext, nonce, vaultKey)));
};

/**
 * Encrypts a file
 * and returns all the data required by the `POST /:id/saved-files` endpoint
 * (the encrypted file, the encryptedMetadata, and the keyFingerprint).
 * @param {File} file a JS File object (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param {string} encryptedMetadata
 * @param {string} keyFingerprint
*/
export const encryptFileForVault = async (file, vaultKey) => {
  const { metaData, encryptedFile } = await encryptFile(file);

  const { encryptedMetadata, keyFingerprint } = encryptFileMetadataForVault(metaData, vaultKey);

  return {
    encryptedFile,
    encryptedMetadata,
    keyFingerprint,
  };
};
