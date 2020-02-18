import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import { getEncryptedSecretsBackup } from '../HttpApi';

import {
  decryptSecretsBackup,
} from '../BackupEncryption';

// ACTION TYPES

export const CRYPTO_SET_SECRET_KEY = Symbol('CRYPTO_SET_SECRET_KEY'); // XXX unused?
export const CRYPTO_SET_SECRETS = Symbol('CRYPTO_SET_SECRETS');
export const CRYPTO_SET_BACKUP_KEY = Symbol('CRYPTO_SET_BACKUP_KEY');

// ACTION BUILDERS

// XXX unused part of the state?
export const setUserSecretKey = (secretKey) => ({
  type: CRYPTO_SET_SECRET_KEY,
  secretKey,
});

const setSecrets = (secrets) => ({
  type: CRYPTO_SET_SECRETS,
  secrets,
});

export const setBackupKey = (backupKey) => ({
  type: CRYPTO_SET_BACKUP_KEY,
  backupKey,
});

export function loadSecretsBackup(password, encryptedBackupDataOrNil, force = false) {
  return async (dispatch, getState) => {
    // values to return
    let backupKey;
    let secrets;

    const cryptoStore = getState().crypto;

    if (isEmpty(cryptoStore.secrets) || force) {
      const userId = getState().auth.profile.id;
      const encryptedBackupData = isNil(encryptedBackupDataOrNil)
        ? await getEncryptedSecretsBackup(userId)
        : encryptedBackupDataOrNil;

      ({
        backupKey,
        secretBackup: secrets,
      } = await decryptSecretsBackup(encryptedBackupData, password));

      dispatch(setBackupKey(backupKey));
      dispatch(setSecrets(secrets));
    } else {
      // no need to load crypto
      ({ secrets, backupKey } = cryptoStore);
    }

    return {
      backupKey,
      secrets,
    };
  };
}
