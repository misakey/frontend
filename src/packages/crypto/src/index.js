import {
  generateAsymmetricKeyPair,
  generateNewSaltedSymmetricKey,
} from './crypto';
import {
  encryptSecretsBackup,
} from './BackupEncryption';


export async function createNewOwnerSecrets(password) {
  const { secretKey, publicKey } = generateAsymmetricKeyPair();

  const secrets = {
    secretKey,
  };

  const backupKey = await generateNewSaltedSymmetricKey(password);
  const encryptedSecrets = encryptSecretsBackup(secrets, backupKey);

  return {
    backupKey,
    backupData: encryptedSecrets,
    pubkeyData: publicKey,
  };
}

/**
 * Returns the data related to crypto
 * that must be sent to the backend for a "hard password reset" procedure.
 * WARNING: for now this does not take the (unused) MK Data protocol into account.
 *
 * @param {string} newPassword
 */
export async function hardPasswordChange(newPassword) {
  const {
    backupData,
    pubkeyData,
  } = await createNewOwnerSecrets(newPassword);

  return {
    backupData,
    pubkeys: {
      userPubkey: pubkeyData,
    },
  };
}
