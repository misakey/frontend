import {
  encodeUTF8,
} from 'tweetnacl-util';

import {
  saltedSymmetricDecrypt,
} from '../crypto';

import {
  DecryptionError,
  BackupDecryptionError,
} from '../Errors/classes';

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
