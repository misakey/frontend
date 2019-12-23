import './testHelpers/argon2Mocking';

import {
  generateAsymmetricKeyPair, asymmetricEncrypt, asymmetricDecrypt,
  generateNewSaltedSymmetricKey,
  saltedSymmetricEncrypt, saltedSymmetricDecrypt,
  DecryptionError,
} from './crypto';

const RANDOM_BYTES = Uint8Array.from([
  32, 57, 252, 228, 154, 165, 224, 88,
  201, 126, 210, 204, 5, 201, 73, 170,
  217, 39, 178, 241, 29, 196, 151, 219,
  84, 204, 184, 231, 160, 113, 173, 198,
]);

const TEST_VALUE_NEW_SERIALIZATION = {
  cryptogram: '{"ephemeralSenderPublicKey":{"type":"Uint8Array","encoding":"base64","value":"XSxGlilqwD1HhTXLVdLYkfl5ZxKl439RPSaCp2Sbgyk="},"recipientPublicKey":{"type":"Uint8Array","encoding":"base64","value":"MjfzQRH3pibVoGjeXoLUcuX8n6jY00JPqLzIl5KuOmg="},"nonce":{"type":"Uint8Array","encoding":"base64","value":"yfwKqHYbK3ZJaAz4F/nfvM++Rh0A+dgU"},"ciphertext":{"type":"Uint8Array","encoding":"base64","value":"sN8CHgw4/hnQXNlM4PE+U0aJj2eFzhHmVaTdjHCeymfeDqGUut0z1JxMrQdUUexr"}}',
  recipientSecretKey: '/MgRlLvKpqc0K65xhp2FV53kaCiahgTf0WMcN5PPaP8=',
};

it('encrypts and decrypts asymmetrically', () => {
  const plaintext = RANDOM_BYTES;
  const recipientKeyPair = generateAsymmetricKeyPair();
  const cryptogram = asymmetricEncrypt(plaintext, recipientKeyPair.publicKey);
  const decrypted = asymmetricDecrypt(cryptogram, recipientKeyPair.secretKey);
  expect(decrypted).toEqual(plaintext);
});

test('decrypts messages using new serialization method', () => {
  expect(() => asymmetricDecrypt(
    TEST_VALUE_NEW_SERIALIZATION.cryptogram,
    TEST_VALUE_NEW_SERIALIZATION.recipientSecretKey,
  )).not.toThrow();
});

it('encrypts and decrypts asymmetrically with recipient public key attached', () => {
  const plaintext = RANDOM_BYTES;
  const recipientKeyPair = generateAsymmetricKeyPair();
  const options = { includeRecipientPublicKey: true };
  const cryptogram = asymmetricEncrypt(plaintext, recipientKeyPair.publicKey, options);
  const decrypted = asymmetricDecrypt(cryptogram, recipientKeyPair.secretKey);
  expect(decrypted).toEqual(plaintext);
});

it('encrypts and decrypts in salted symmetric fashion', async () => {
  const lowEntropySecret = 'password';
  const plaintext = RANDOM_BYTES;
  const saltedSymmetricKey = await generateNewSaltedSymmetricKey(lowEntropySecret);
  const cryptogram = saltedSymmetricEncrypt(plaintext, saltedSymmetricKey);
  const {
    plaintext: decrypted,
    saltedSymmetricKey: saltedSymmetricKey2,
  } = await saltedSymmetricDecrypt(cryptogram, lowEntropySecret);
  expect(decrypted).toEqual(plaintext);
  expect(saltedSymmetricKey2).toEqual(saltedSymmetricKey);
});

it('throws a DecryptionError on bad salted symmetric key', async () => {
  const plaintext = RANDOM_BYTES;
  const saltedSymmetricKey = await generateNewSaltedSymmetricKey('password');
  const cryptogram = saltedSymmetricEncrypt(plaintext, saltedSymmetricKey);
  // a nicer alternative to using a try/catch block
  // and having to call expect.assertions(number) at the beginning of the test
  await expect(saltedSymmetricDecrypt(cryptogram, 'badPassword'))
    .rejects.toThrow(DecryptionError);
});
