import {
  encodeUTF8,
  decodeUTF8,
} from 'tweetnacl-util';

import {
  saltedSymmetricEncrypt,
  saltedSymmetricDecrypt,
} from './crypto';

import {
  DecryptionError,
  BackupDecryptionError,
} from './Errors/classes';

// Note that decryption is asynchronous while encryption is not;
// this is because decryption derives the backup key from the password
// while encryption is given the backup key.
// (see './crypto' for details).
// Right now it makes sense because
// the only times we have to call saltedSymmetricDecrypt
// (when we load secrets from the encrypted backup at the server),
// we have the password in scope
// but we probably don't have the backup key in scope.
// However in a situation where we can avoid having to derive the backup key from the password
// before decryption (a very costly operation),
// it can be interesting to do so.

export function encryptSecretsBackup(literalObject, backupKey) {
  const toEncrypt = decodeUTF8(JSON.stringify(literalObject));
  return saltedSymmetricEncrypt(toEncrypt, backupKey);
}

export async function decryptSecretsBackup(encryptedSecretsBackup, password) {
  let decrypted;
  let backupKey;
  try {
    const {
      plaintext,
      saltedSymmetricKey,
    } = await saltedSymmetricDecrypt(encryptedSecretsBackup, password);
    decrypted = plaintext;
    backupKey = saltedSymmetricKey;
  } catch (error) {
    if (error instanceof DecryptionError) {
      throw new BackupDecryptionError();
    } else {
      throw error;
    }
  }

  const secretBackup = JSON.parse(encodeUTF8(decrypted));

  return { backupKey, secretBackup };
}
