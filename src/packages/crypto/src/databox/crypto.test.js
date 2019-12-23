import {
  generateAsymmetricKeyPair, encryptBlob, decryptBlobToBytes,
  encryptBlobFile, decryptToJSBlob,
} from './crypto';

import { fileToUint8Array, blobFromUint8Array } from './cryptoUtils';

const blobBytes = Uint8Array.from([
  32, 57, 252, 228, 154, 165, 224, 88,
  201, 126, 210, 204, 5, 201, 73, 170,
  217, 39, 178, 241, 29, 196, 151, 219,
  84, 204, 184, 231, 160, 113, 173, 198,
]);

it('encrypts and decrypts Uint8Arrays', () => {
  const ownerKeyPair = generateAsymmetricKeyPair();
  const {
    ciphertext, nonce,
    ephemeralProducerPubKey,
  } = encryptBlob(blobBytes, ownerKeyPair.publicKey);
  const decrypted = decryptBlobToBytes(
    ciphertext, nonce,
    ephemeralProducerPubKey, ownerKeyPair.secretKey,
  );
  expect(decrypted).toEqual(blobBytes);
});

it('converts Uint8Arrays to Blobs and back', async () => {
  const a = new Uint8Array([
    24, 44, 134, 156, 74, 10, 4, 160, 223, 182, 240, 123, 255, 157, 124, 106,
    181, 34, 221, 68, 214, 43, 114, 140, 174, 14, 55, 79, 139, 34, 86, 56, 13,
    133, 201, 50, 173, 243, 165, 169, 84, 40, 138, 155, 173, 34, 210, 236,
  ]);
  const b = blobFromUint8Array(a);
  const aa = await fileToUint8Array(b);
  expect(aa).toEqual(a);
});

it('detects whether to add a byteOffset or not', async () => {
  // byteOffset should be ignored
  // because the byte array does not starts with 16 zeros
  const byteOffset = 18;
  const a = new Uint8Array([
    24, 44, 134, 156, 74, 10, 4, 160, 223, 182, 240, 123, 255, 157, 124, 106,
    181, 34, 221, 68, 214, 43, 114, 140, 174, 14, 55, 79, 139, 34, 86, 56, 13,
    133, 201, 50, 173, 243, 165, 169, 84, 40, 138, 155, 173, 34, 210, 236,
  ]);
  const b = blobFromUint8Array(a);
  const aa = await fileToUint8Array(b, byteOffset);
  expect(aa).toEqual(a);
});

it('encrypts and decrypts Blobs', async () => {
  const ownerKeyPair = generateAsymmetricKeyPair();
  const blob = new Blob([blobBytes.buffer], { type: 'application/octet-stream' });
  const {
    ciphertext, nonce, ephemeralProducerPubKey,
  } = await encryptBlobFile(blob, ownerKeyPair.publicKey);
  const decrypted = await decryptToJSBlob(
    ciphertext, nonce,
    ephemeralProducerPubKey, ownerKeyPair.secretKey,
  );
  expect(decrypted).toEqual(blob);
});
