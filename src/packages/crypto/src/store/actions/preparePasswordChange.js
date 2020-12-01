import logSentry from '@misakey/helpers/log/sentry';

import { generateNewSaltedSymmetricKey } from '@misakey/crypto/crypto';
import { encryptSecretsBackup } from '@misakey/crypto/secretsBackup/encryption';

import ensureSecretsLoaded from './ensureSecretsLoaded';
import createNewBackupKeyShares from './createNewBackupKeyShares';
import setBackupVersion from './setBackupVersion';

import { CRYPTO_SET_BACKUP_KEY } from './types';

export default function preparePasswordChange(newPassword, oldPassword, accountId) {
  return async (dispatch, getState) => {
    await dispatch(ensureSecretsLoaded({ password: oldPassword }));

    const { secrets, backupVersion } = getState().crypto;
    const newBackupVersion = backupVersion + 1;
    const newBackupKey = await generateNewSaltedSymmetricKey(newPassword);
    const newEncryptedSecretsBackup = encryptSecretsBackup(secrets, newBackupKey);

    return {
      backupData: newEncryptedSecretsBackup,
      backupVersion: newBackupVersion,
      backupKey: newBackupKey,
      commitPasswordChange: async () => {
        await Promise.all([
          dispatch({
            type: CRYPTO_SET_BACKUP_KEY,
            backupKey: newBackupKey,
          }),
          dispatch(setBackupVersion(newBackupVersion)),
        ]);

        try {
          // since the backup key changed
          // we must update the backup key shares as well
          return dispatch(createNewBackupKeyShares({
            backupKey: newBackupKey,
            accountId,
          }));
        } catch (error) {
          logSentry(error, 'passwordChange: createNewBackupKeyShares', { crypto: true });
          // we don't throw because the failing of the update of backup key share
          // should not cause the password change procedure to fail;
          // if updating the backup key share fails,
          // the user will simply have to type her password again next time she goes to the app.
          return Promise.resolve();
        }
      },
    };
  };
}
