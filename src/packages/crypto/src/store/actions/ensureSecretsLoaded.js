import { getEncryptedSecretsBackup } from '../../HttpApi';
import { decryptSecretsBackup } from '../../secretsBackup/encryption';
import { CRYPTO_LOAD_SECRETS } from './concrete';
import {
  promptForPasswordUntilOK,
  secretsAreLoaded,
} from './helpers';

const bindTryPassword = (encryptedBackupData, dispatch) => async (password) => {
  const {
    backupKey,
    secretBackup: secrets,
  } = await decryptSecretsBackup(encryptedBackupData, password);

  dispatch({
    type: CRYPTO_LOAD_SECRETS,
    secrets,
    backupKey,
  });
};

export default function ensureSecretsLoaded({ password, openPasswordPrompt }) {
  return async (dispatch, getState) => {
    const store = getState();

    if (secretsAreLoaded(store)) {
      return;
    }

    const userId = store.auth.profile.id;
    const encryptedBackupData = await getEncryptedSecretsBackup(userId);

    const tryPassword = bindTryPassword(encryptedBackupData, dispatch);

    if (password) {
      await tryPassword(password);
    } else {
      await promptForPasswordUntilOK(
        tryPassword,
        openPasswordPrompt,
      );
    }
  };
}
