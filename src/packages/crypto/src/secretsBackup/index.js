import { updateSecretsBackup as httpApiUpdateSecretsBackup } from '../HttpApi';

import { encryptSecretsBackup } from './encryption';

export async function updateSecretsBackup(userId, secrets, backupKey, backupVersion) {
  const encryptedSecrets = encryptSecretsBackup(secrets, backupKey);
  return httpApiUpdateSecretsBackup(userId, encryptedSecrets, backupVersion);
}
