/* This file mostly tests the "databox" part of the exported instances for now
 * the Mk Data parts are mostly tested in classes.test.js
 */

import {
  ownerCryptoContext,
  producerCryptoContext,
} from './index';

import './testHelpers/argon2Mocking';

window.env = {
  API_ENDPOINT: 'whatever',
};

const blobBytes = Uint8Array.from([
  32, 57, 252, 228, 154, 165, 224, 88,
  201, 126, 210, 204, 5, 201, 73, 170,
  217, 39, 178, 241, 29, 196, 151, 219,
  84, 204, 184, 231, 160, 113, 173, 198,
]);

jest.spyOn(global, 'fetch');

test('instance exported by index.js is usable', async () => {
  ownerCryptoContext.initialize('owner123');
  expect(ownerCryptoContext.databox.isReadyToDecrypt()).toBeFalsy();

  fetch.mockResolvedValue(new Response());
  ownerCryptoContext.createNewOwnerSecrets('password');
  expect(ownerCryptoContext.databox.isReadyToDecrypt()).toBeTruthy();

  const ownerPublicKey = ownerCryptoContext.databox.getPublicKey();
  producerCryptoContext.databox.addOwner('owner123', ownerPublicKey);
  const blob = new Blob([blobBytes.buffer], { type: 'application/octet-stream' });
  const { ciphertext, nonce, ephemeralProducerPubKey } = await producerCryptoContext.databox.encryptBlob(blob, 'owner123');

  const decrypted = await ownerCryptoContext.databox.decryptBlob(
    ciphertext,
    nonce,
    ephemeralProducerPubKey,
  );
  expect(decrypted).toEqual(blob);
});
