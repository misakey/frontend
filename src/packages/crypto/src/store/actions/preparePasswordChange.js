import ensureSecretsLoaded from './ensureSecretsLoaded';

import { generateNewSaltedSymmetricKey } from '../../crypto';
import { encryptSecretsBackup } from '../../secretsBackup/encryption';

import {
  setBackupKey,
  setBackupVersion,
} from './concrete';

export default function preparePasswordChange(newPassword, oldPassword) {
  return async (dispatch, getState) => {
    await dispatch(ensureSecretsLoaded({ password: oldPassword }));

    const { secrets, backupVersion } = getState().crypto;
    const newBackupKey = await generateNewSaltedSymmetricKey(newPassword);
    const newEncryptedSecretsBackup = encryptSecretsBackup(secrets, newBackupKey);

    return {
      backupData: newEncryptedSecretsBackup,
      backupVersion,
      commitPasswordChange: async () => Promise.all([
        dispatch(setBackupKey(newBackupKey)),
        dispatch(setBackupVersion(backupVersion + 1)),
      ]),
    };
  };
}
