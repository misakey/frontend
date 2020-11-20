import {
  generateAsymmetricKeyPair,
  generateNewSaltedSymmetricKey,
  generateSymmetricKey,
} from '@misakey/crypto/crypto';
import {
  encryptSecretsBackup,
} from '@misakey/crypto/secretsBackup/encryption';

import {
  CRYPTO_INITIALIZE,
} from './types';

/**
 * Creates a new set of secrets for a data owner.
 *
 * **No backup update** (backup update is handled by application code
 * using the values returned by this thunk)
 * @param {string} password
 */
export default function createNewOwnerSecrets(password) {
  return async (dispatch, getState) => {
    const { secretKey, publicKey } = generateAsymmetricKeyPair();

    const backupKey = await generateNewSaltedSymmetricKey(password);
    const vaultKey = await generateSymmetricKey();

    dispatch({
      type: CRYPTO_INITIALIZE,
      secretKey,
      backupKey,
      vaultKey,
    });

    const encryptedSecrets = encryptSecretsBackup(
      getState().crypto.secrets,
      backupKey,
    );

    // return value is more important than what is dispatched in this thunk
    // because application code uses the returned data to send it to the server.
    // We could avoid dispatching and it shouldn't break anything,
    // it would simply require the user to "open her vault"
    // the first time she wants to do an operation requiring crypto.
    // We still use dispatch so that crypto initialization is part of Redux state management.
    // This allows, among other things, to test that the state we create on initialization
    // will be correctly interpreted by functions reading the store.
    return {
      backupKey,
      backupData: encryptedSecrets,
      pubkeyData: publicKey,
    };
  };
}
