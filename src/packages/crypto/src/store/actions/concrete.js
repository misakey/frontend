/**
 * We call "concrete" actions
 * actions that either return or dispatch "actual" actions,
 * an actual action being an object with an action type.
 *
 * CAUTION: *Most* of the concrete actions
 * require the remote secret backup to be updated after they have been dispatched.
 * This is done by wrapping the action builder with "withBackupUpdater".
 */

import get from '@misakey/helpers/get';
import props from '@misakey/helpers/props';
import values from '@misakey/helpers/values';
import difference from '@misakey/helpers/difference';
import isEmpty from '@misakey/helpers/isEmpty';
import filter from '@misakey/helpers/filter';
import isString from '@misakey/helpers/isString';

import { updateSecretsBackup } from '../../secretsBackup';
import {
  encryptSecretsBackup,
} from '../../secretsBackup/encryption';
import {
  generateAsymmetricKeyPair,
  generateNewSaltedSymmetricKey,
} from '../../crypto';
import {
  NoNewSecretKeys,
} from '../../Errors/classes';

// HELPERS

// @TODO move to a "helpers" directory?
/**
 * List secret keys in a snapshot of the cryptographic secrets of a user.
 * This function includes some security mechanisms
 * by guaranteeing that it returns a (flat) list of strings
 * (thanks to the use of the "filter" function)
 *
 * @param {object} secrets A snapshot of "store.getState().crypto.secrets"
 */
const listSecretKeys = (secrets) => [
  // picking keys individually
  ...filter(values(props(['secretKey'], secrets)), isString),
  // spreading lists (defaulting to empty list to avoid type errors)
  ...filter(get(secrets, 'passive.secretKeys', []), isString),
];

/**
 * Decorates an action builder
 * and returns a thunk that will dispatch the action
 * then update the remote secrets backup.
 *
 * Almost all actions related to crypto should be made using this decorator
 * @param {function} actionBuilder
 */
const withBackupUpdater = (actionBuilder) => (...args) => (
  async (dispatch, getState) => {
    // @FIXME not sure we need an "await" here,
    // The dispatch used by the thunk is probably the normal, synchronous redux dispatch.
    await dispatch(actionBuilder(...args));

    const state = getState();
    const userId = state.auth.profile.id;
    const { secrets, backupKey } = state.crypto;
    return updateSecretsBackup(userId, secrets, backupKey);
  }
);

// ACTION TYPES
export const CRYPTO_LOAD_SECRETS = Symbol('CRYPTO_LOAD_SECRETS');
export const CRYPTO_SET_BACKUP_KEY = Symbol('CRYPTO_SET_BACKUP_KEY');
export const CRYPTO_IMPORT_SECRET_KEYS = Symbol('CRYPTO_IMPORT_SECRET_KEYS');
export const CRYPTO_INITIALIZE = Symbol('CRYPTO_INITIALIZE');

// ACTION BUILDERS
// @FIXME maybe apply "withBackupUpdater" later
// to make it more obvious that it is required?
// I am not sure how I would name the non-exported entities, though

export const setBackupKey = withBackupUpdater((backupKey) => ({
  type: CRYPTO_SET_BACKUP_KEY,
  backupKey,
}));

export const importKeys = withBackupUpdater((secretsToImport) => (
  async (dispatch, getState) => {
    const cryptoState = getState().crypto;
    // (using plural because in the future there may be several)
    const currentActiveSecretKeys = [
      cryptoState.secrets.secretKey,
    ];
    const currentPassiveSecretKeys = [
      ...cryptoState.secrets.passive.secretKeys,
    ];

    const potentiallyNewSecretKeys = listSecretKeys(secretsToImport);

    const actuallyNewSecretKeys = difference(
      potentiallyNewSecretKeys,
      [
        ...currentActiveSecretKeys,
        ...currentPassiveSecretKeys,
      ],
    );

    if (isEmpty(actuallyNewSecretKeys)) {
      throw new NoNewSecretKeys(potentiallyNewSecretKeys);
    }

    dispatch({
      type: CRYPTO_IMPORT_SECRET_KEYS,
      secretKeys: actuallyNewSecretKeys,
    });
  }
));

/**
 * Creates a new set of secrets for a data owner.
 *
 * **No backup update** (backup update is handled by application code
 * using the values returned by this thunk)
 * @param {string} password
 */
export function createNewOwnerSecrets(password) {
  return async (dispatch, getState) => {
    const { secretKey, publicKey } = generateAsymmetricKeyPair();

    const backupKey = await generateNewSaltedSymmetricKey(password);

    dispatch({
      type: CRYPTO_INITIALIZE,
      secretKey,
      backupKey,
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
