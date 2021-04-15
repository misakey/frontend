import { generateAsymmetricKeyPair } from '../crypto';

import encryptFile from './encryptFile';
import decryptFile from './decryptFile';
import decryptFileMsg from './decryptFileMsg';

const TEST_FILE_BYTES = Uint8Array.from([
  32, 57, 252, 228, 154, 165, 224, 88,
  201, 126, 210, 204, 5, 201, 73, 170,
  217, 39, 178, 241, 29, 196, 151, 219,
  84, 204, 184, 231, 160, 113, 173, 198,
]);

test('encrypts and decrypts files', async () => {
  const filename = 'testName';

  const {
    secretKey: boxSecretKey,
    publicKey: boxPublicKey,
  } = generateAsymmetricKeyPair();

  const {
    encryptedFile,
    encryptedMessageContent,
  } = await encryptFile(TEST_FILE_BYTES, boxPublicKey, filename);

  const decryptedContent = decryptFileMsg(encryptedMessageContent, boxSecretKey);

  const decrypted = await decryptFile(encryptedFile, decryptedContent);

  expect(decrypted).toEqual(TEST_FILE_BYTES);
});
