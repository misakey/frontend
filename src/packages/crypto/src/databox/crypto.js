// almost all functions are "exported"
// but most are not exported by the lib itself,
// it's just that exporting is required for testing

import { box, randomBytes } from 'tweetnacl';

import {
  decodeBase64, encodeBase64,
} from '../helpers/base64';

import {
  fileToUint8Array, blobFromUint8Array,
} from './cryptoUtils';

// "raw" means it's not base64-encoded, here
const generateRawAsymmetricKeyPair = () => box.keyPair();

export function generateAsymmetricKeyPair() {
  const keyPair = generateRawAsymmetricKeyPair();
  return {
    secretKey: encodeBase64(keyPair.secretKey),
    publicKey: encodeBase64(keyPair.publicKey),
  };
}

export function keyPairFromSecretKey(secretKey) {
  const keyPair = box.keyPair.fromSecretKey(decodeBase64(secretKey));
  return {
    secretKey: encodeBase64(keyPair.secretKey),
    publicKey: encodeBase64(keyPair.publicKey),
  };
}

// Note: a nonce does not have to be kept secret
// (it is often attached to ciphertext, unencrypted)
export function encryptBlob(blob, ownerPubKey) {
  const nonce = randomBytes(box.nonceLength);
  const ephemeralProducerKeyPair = generateRawAsymmetricKeyPair();
  const ephemeralProducerSecretKey = ephemeralProducerKeyPair.secretKey;
  const ownerPubKeyDecoded = decodeBase64(ownerPubKey);

  const ciphertext = box(blob, nonce, ownerPubKeyDecoded, ephemeralProducerSecretKey);

  return {
    ciphertext,
    nonce: encodeBase64(nonce),
    ownerPubKey,
    ephemeralProducerPubKey: encodeBase64(ephemeralProducerKeyPair.publicKey),
  };
}

export function decryptBlobToBytes(ciphertext, nonce, ephemeralProducerPubKey, ownerSecretKey) {
  const ephemeralProducerPubKeyDecoded = decodeBase64(ephemeralProducerPubKey);
  const ownerSecretKeyDecoded = decodeBase64(ownerSecretKey);
  const nonceDecoded = decodeBase64(nonce);
  const decrypted = box.open(
    ciphertext,
    nonceDecoded,
    ephemeralProducerPubKeyDecoded, ownerSecretKeyDecoded,
  );

  if (!decrypted) {
    throw Error('decryption error');
  }

  return decrypted;
}

// input "blobFile"
// is a JS "File" or "Blob" object
// (see https://developer.mozilla.org/en-US/docs/Web/API/File)
export function encryptBlobFile(blobFile, ownerPubKey) {
  return fileToUint8Array(blobFile)
    .then((blobUint8Array) => {
      const encryptorOutput = encryptBlob(blobUint8Array, ownerPubKey);
      const ciphertextAsBlob = blobFromUint8Array(encryptorOutput.ciphertext);
      return {
        ...encryptorOutput,
        ciphertext: ciphertextAsBlob,
      };
    })
    // eslint-disable-next-line no-console
    .catch((reason) => console.error('error encrypting JS blob:', reason));
}

export function decryptToJSBlob(ciphertext, nonce, ephemeralProducerPubKey, ownerSecretKey) {
  // Ciphertexts from tweetnacl-js need a byte offset of 16
  // (this is how tweetnacl-js manages the zero-padding
  // from NaCl specifications)
  // see:
  // - http://nacl.cr.yp.to/box.html
  // - https://gitlab.misakey.dev/misakey/crypto-js-sdk/merge_requests/7/diffs
  const byteOffset = 16;
  return fileToUint8Array(ciphertext, byteOffset)
    .then((ciphertextUint8Array) => {
      const decrypted = decryptBlobToBytes(
        ciphertextUint8Array, nonce, ephemeralProducerPubKey, ownerSecretKey,
      );

      // @FIXME decrypted.byteOffset seems to be 32 here,
      // it does not seem to break anything
      // but it's weird and it should be investigated

      // we don't want to keep zero padding in decrypted data
      return blobFromUint8Array(decrypted, /* dropByteBeforeOffset = */ true);
    });
}
