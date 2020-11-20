import { getEncryptedSecretsBackup } from '../../HttpApi';
import { decryptSecretsBackup } from '../../secretsBackup/encryption';
import { CRYPTO_LOAD_SECRETS } from './types';
import {
  promptForPasswordUntilOK,
  secretsAreLoaded,
} from './helpers';

const bindTryPassword = (encryptedSecretsBackup, dispatch) => async (password) => {
  const { data, version: backupVersion } = encryptedSecretsBackup;

  const {
    backupKey,
    secretBackup: secrets,
  } = await decryptSecretsBackup(data, password);

  dispatch({
    type: CRYPTO_LOAD_SECRETS,
    secrets,
    backupKey,
    backupVersion,
  });
};

export default function ensureSecretsLoaded({ password, openPasswordPrompt }) {
  return async (dispatch, getState) => {
    const store = getState();

    if (secretsAreLoaded(store)) {
      return;
    }

    const { accountId } = store.auth.identity;
    const encryptedSecretsBackup = await getEncryptedSecretsBackup(accountId);

    const tryPassword = bindTryPassword(encryptedSecretsBackup, dispatch);

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
