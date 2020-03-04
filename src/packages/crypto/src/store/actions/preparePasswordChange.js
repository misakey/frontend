import ensureSecretsLoaded from './ensureSecretsLoaded';

import { generateNewSaltedSymmetricKey } from '../../crypto';
import { encryptSecretsBackup } from '../../secretsBackup/encryption';

import { setBackupKey } from './concrete';

export default function preparePasswordChange(newPassword, oldPassword) {
  return async (dispatch, getState) => {
    await dispatch(ensureSecretsLoaded({ password: oldPassword }));

    const { secrets } = getState().crypto;
    const newBackupKey = await generateNewSaltedSymmetricKey(newPassword);
    const newEncryptedSecretsBackup = encryptSecretsBackup(secrets, newBackupKey);

    return {
      backupData: newEncryptedSecretsBackup,
      commitPasswordChange: async () => dispatch(setBackupKey(newBackupKey)),
    };
  };
}
