// almost all functions are "exported"
// but most are not exported by the lib itself,
// it's just that exporting is required for testing

// Note that "Blob" always has the meaning of "JavaScript Blob" here
// (see https://developer.mozilla.org/en-US/docs/Web/API/Blob)
// in the past we were speaking of "Blob" for encrypted data as well
// but this has been changed
// (see https://gitlab.misakey.dev/misakey/specifications/issues/175)

import { box, secretbox, randomBytes } from 'tweetnacl';
import { encodeHex } from '../helpers/encodeHex';
import { hasArgon2 } from '../helpers/hasArgon2';
import { Uint8ArraysAreEqual } from '../helpers/Uint8ArraysAreEqual';
import { DecryptionError } from '../Errors/classes';

const SALT_LENGTH = 16;

// Asymmetric Key Generation
// ============================================================================

export const generateAsymmetricKeyPair = () => box.keyPair();

export const keyPairFromSecretKey = (secretKey) => (
  box.keyPair.fromSecretKey(secretKey)
);

// Asymmetric Encryption and Decryption
// ============================================================================

export function asymmetricEncrypt(plaintext, recipientPublicKey) {
  const nonce = randomBytes(box.nonceLength);
  const ephemeralSenderKeyPair = generateAsymmetricKeyPair();
  const ephemeralSenderSecretKey = ephemeralSenderKeyPair.secretKey;

  const ciphertext = box(plaintext, nonce, recipientPublicKey, ephemeralSenderSecretKey);

  const ephemeralSenderPublicKey = ephemeralSenderKeyPair.publicKey;

  return { ephemeralSenderPublicKey, nonce, ciphertext };
}

export function asymmetricDecrypt(
  ciphertext, nonce, recipientSecretKey, recipientPublicKey, ephemeralSenderPublicKey,
) {
  if (recipientPublicKey) {
    const keyPair = box.keyPair.fromSecretKey(recipientSecretKey);
    const expectedRecipientPublicKey = keyPair.publicKey;
    if (!Uint8ArraysAreEqual(recipientPublicKey, expectedRecipientPublicKey)) {
      throw Error(
        'Attached recipient public key does not have the expected value: \n'
        + `  expected ${expectedRecipientPublicKey}, \n`
        + `  got ${recipientPublicKey}`,
      );
    }
  }

  const decrypted = box.open(
    ciphertext, nonce,
    ephemeralSenderPublicKey, recipientSecretKey,
  );

  if (!decrypted) { throw new DecryptionError(); }

  return decrypted;
}

// Symmetric Encryption (using high-entropy keys)
// ========================================================
//
// For symmetric encryption using a low-entropy secret (password),
// see next section.

export const generateSymmetricKey = () => randomBytes(secretbox.keyLength);

export function symmetricEncrypt(plaintext, symmetricKey) {
  const nonce = randomBytes(secretbox.nonceLength);
  const ciphertext = secretbox(plaintext, nonce, symmetricKey);

  return { nonce, ciphertext };
}

export function symmetricDecrypt(ciphertext, nonce, symmetricKey) {
  const decrypted = secretbox.open(ciphertext, nonce, symmetricKey);

  if (!decrypted) { throw new DecryptionError(); }

  return decrypted;
}

// Symmetric Key Encryption from Low-Entropy Secrets
// ============================================================================
//
// Symmetric key is derived from low-entropy secret (typically, a password)
// using a random salt.
// The salt is necessary to decrypt encrypted data using the low entropy secret,
// so it is attached to the ciphertext.

export async function deriveSymmetricKeyFromLowEntropySecret(lowEntropySecret, salt) {
  if (!hasArgon2()) { throw Error('Argon2 not available, cannot derive symmetric key'); }
  const params = {
    pass: lowEntropySecret,
    salt,
    time: 1,
    mem: 1024,
    hashLen: secretbox.keyLength,
    type: window.argon2.ArgonType.Argon2i,
  };

  const argon2Result = await window.argon2.hash(params);

  return argon2Result.hash;
}

export async function generateNewSaltedSymmetricKey(lowEntropySecret) {
  const salt = encodeHex(randomBytes(SALT_LENGTH));
  const symmetricKey = await deriveSymmetricKeyFromLowEntropySecret(lowEntropySecret, salt);
  const saltedSymmetricKey = { symmetricKey, salt };
  return saltedSymmetricKey;
}

export function saltedSymmetricEncrypt(plaintext, saltedSymmetricKey) {
  const { symmetricKey, salt } = saltedSymmetricKey;

  const { nonce, ciphertext } = symmetricEncrypt(plaintext, symmetricKey);

  return { nonce, salt, ciphertext };
}

export async function saltedSymmetricDecrypt(nonce, salt, ciphertext, lowEntropySecret) {
  const symmetricKey = await deriveSymmetricKeyFromLowEntropySecret(lowEntropySecret, salt);

  const decrypted = symmetricDecrypt(ciphertext, nonce, symmetricKey);

  return {
    plaintext: decrypted,
    saltedSymmetricKey: { symmetricKey, salt },
  };
}
