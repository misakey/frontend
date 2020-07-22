import {
  generateSymmetricKey,
} from './core';

import {
  encodeBase64,
} from '../helpers/base64';

import { symmetricEncrypt, symmetricDecrypt } from '.';

const TEST_BYTES = Uint8Array.from([
  32, 57, 252, 228, 154, 165, 224, 88,
  201, 126, 210, 204, 5, 201, 73, 170,
  217, 39, 178, 241, 29, 196, 151, 219,
  84, 204, 184, 231, 160, 113, 173, 198,
]);

describe('symmetric crypto', () => {
  // For file keys that were created before the switch to URL-safe
  it('handles keys encoded with standard base64', () => {
    const key = encodeBase64(generateSymmetricKey(), { urlSafe: false });

    const plaintext = TEST_BYTES;

    const { nonce, ciphertext } = symmetricEncrypt(plaintext, key);
    const decrypted = symmetricDecrypt(ciphertext, nonce, key);

    expect(decrypted).toEqual(plaintext);
  });
});
