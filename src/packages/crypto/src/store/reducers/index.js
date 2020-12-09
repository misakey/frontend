import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import isNil from '@misakey/helpers/isNil';
import mergeWith from '@misakey/helpers/mergeWith';
import isArray from '@misakey/helpers/isArray';
import ramdaPath from '@misakey/helpers/path';
import assocPath from '@misakey/helpers/assocPath';
import propOr from '@misakey/helpers/propOr';
import omit from '@misakey/helpers/omit';
import compact from '@misakey/helpers/compact';
import pathOr from '@misakey/helpers/pathOr';
import pick from '@misakey/helpers/pick';
import without from '@misakey/helpers/without';
import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { createSelector } from 'reselect';

import { SIGN_OUT } from '@misakey/auth/store/actions/auth';

import {
  CRYPTO_LOAD_SECRETS,
  CRYPTO_SET_BACKUP_KEY,
  CRYPTO_IMPORT_SECRET_KEYS,
  CRYPTO_INITIALIZE,
  CRYPTO_SET_BACKUP_VERSION,
  CRYPTO_SET_BOX_SECRETS,
  CRYPTO_REMOVE_BOX_SECRET_KEYS,
  CRYPTO_SET_ENCRYPTED_BACKUP_DATA,
  CRYPTO_SET_BACKUP_KEY_SHARE,
  CRYPTO_REMOVE_BOX_KEY_SHARES,
  CRYPTO_SET_VAULT_KEY,
  CRYPTO_SET_IDENTITY_KEY,
  CRYPTO_SET_IDENTITY_NON_IDENTIFIED_KEYS,
} from '../actions/types';


// HELPERS
const pathOrEmptyArray = pathOr([]);
const getIdentityPubKeyPath = (publicKey, items) => pathOr(null, ['secretKeys', publicKey])(items);

const concatToPath = (values, destObject, path) => (
  assocPath(
    path,
    [
      ...ramdaPath(path, destObject),
      ...values,
    ],
    destObject,
  )
);


// INITIAL STATE
export const INITIAL_STATE = {
  backupKey: null,
  backupVersion: null,
  backupKeyShares: {},
  data: null,
  secrets: {
    // @FIXME rename "secretKey" to "userDecryptionKey"
    secretKey: null,
    vaultKey: null,
    identityKeys: {
      publicKeys: {},
      secretKeys: {},
    },
    identityNonIdentifiedKeys: {
      publicKeys: {},
      secretKeys: {},
    },
    boxKeyShares: {},
    boxDecryptionKeys: [],
    // "passive" encryption keys are keys that must not be used any more for encrypting data;
    // they are only kept for decrypting data that was encrypted for them in the past.
    // This is typically used when recovering old keys that were retired after being lost.
    passive: {
      secretKeys: [],
      vaultKey: [],
      boxDecryptionKeys: [],
    },
  },
};

// SELECTORS
const getState = (state) => state.crypto;

const isCryptoLoaded = createSelector(
  getState,
  (state) => !isNil(state.backupKey),
);

const getBackupKey = createSelector(
  getState,
  (state) => state.backupKey,
);

const getVaultKey = createSelector(
  getState,
  (state) => state.secrets.vaultKey,
);

const makeGetBackupKeyShareForAccount = () => createSelector(
  (state) => getState(state).backupKeyShares,
  (_, accountId) => accountId,
  (items, accountId) => propOr(null, accountId)(items),
);

const areSecretsLoaded = createSelector(
  getState,
  (state) => !isNil(state.secrets.secretKey),
);

const boxesSecretKeys = createSelector(
  getState,
  (state) => state.secrets.boxDecryptionKeys || [],
);

const getEncryptedBackupData = createSelector(
  getState,
  (state) => ({ data: state.data, backupVersion: state.backupVersion }),
);

const getBoxSecretKeys = createSelector(
  getState,
  (state) => state.secrets,
  // "compact" removes falsey values
  (secrets) => compact([
    ...pathOrEmptyArray(['secrets', 'boxDecryptionKeys'], secrets),
    ...pathOrEmptyArray(['secrets', 'passive', 'boxDecryptionKeys'], secrets),
  ]),
);

const getNonIdentifiedKeys = createSelector(
  getState,
  (secrets) => pathOr({}, ['secrets', 'identityNonIdentifiedKeys'])(secrets),
);

const getRelatedIdentitySecretKey = createSelector(
  (state) => getState(state).secrets,
  (_, publicKey) => publicKey,
  (secrets, publicKey) => {
    const { identityKeys, identityNonIdentifiedKeys } = secrets;
    return getIdentityPubKeyPath(publicKey, identityKeys)
      || getIdentityPubKeyPath(publicKey, identityNonIdentifiedKeys);
  },
);

const makeGetBoxKeyShare = () => createSelector(
  (state) => getState(state).secrets.boxKeyShares,
  (_, boxId) => boxId,
  (items, boxId) => {
    const keyShare = propOr(null, boxId)(items);
    // due to a past inconsistency in the way box key shares were added,
    // it is possible that some box key shares are stored as strings instead of objects
    if (typeof keyShare === 'string') {
      return { value: keyShare };
    }
    return keyShare;
  },
);

const makeGetMissingBoxKeyShares = () => createSelector(
  (state) => getState(state).secrets.boxKeyShares,
  (_, ids) => ids,
  (items, ids) => omit(items, ids),
);

export const selectors = {
  getBackupKey,
  getVaultKey,
  makeGetBackupKeyShareForAccount,
  isCryptoLoaded,
  areSecretsLoaded,
  boxesSecretKeys,
  getEncryptedBackupData,
  getBoxSecretKeys,
  makeGetBoxKeyShare,
  makeGetMissingBoxKeyShares,
  getNonIdentifiedKeys,
  getRelatedIdentitySecretKey,
};


// ACTION HANDLERS

function reset() {
  return INITIAL_STATE;
}

function setBackupKey(state, { backupKey }) {
  return {
    ...state,
    backupKey,
  };
}

function setVaultKey(state, { vaultKey }) {
  return {
    ...state,
    secrets: {
      ...state.secrets,
      vaultKey,
    },
  };
}

function setBackupKeyShare(state, { backupKeyShare, accountId }) {
  return {
    ...state,
    backupKeyShares: {
      ...state.backupKeyShares,
      [accountId]: backupKeyShare,
    },
  };
}


function setEncryptedBackupData(state, { data, backupVersion }) {
  return {
    ...state,
    data,
    backupVersion,
  };
}


function setEncryptedBackupVersion(state, { version }) {
  return {
    ...state,
    backupVersion: version,
  };
}


function initialize(state, { backupKey, secretKey, vaultKey }) {
  return {
    ...state,
    secrets: {
      ...state.secrets,
      secretKey,
      vaultKey,
    },
    backupKey,
  };
}

function loadSecrets(state, action) {
  // we use mergeWith because we need the customizer function.
  // XXX the customizer function is used to treat arrays as sets;
  // it would probably be better to use objects (with keys = true)
  // to implement sets.
  return mergeWith(
    {},
    state,
    pick(['secrets', 'backupKey', 'backupVersion'], action),
    (objValue, srcValue) => {
      if (isArray(objValue)) {
        return [...new Set(objValue.concat(srcValue))];
      }
      return undefined;
    },
  );
}

function setBoxSecrets(state, { boxId, secretKey, keyShare }) {
  if (isNil(boxId) && !isNil(keyShare)) {
    throw Error('box ID is required to set a box key share');
  }

  return {
    ...state,
    secrets: {
      ...state.secrets,
      boxDecryptionKeys: (
        isNil(secretKey)
          ? state.secrets.boxDecryptionKeys
          : [...new Set([secretKey].concat(state.secrets.boxDecryptionKeys))]
      ),
      boxKeyShares: (
        (isNil(keyShare) || isNil(boxId))
          ? state.secrets.boxKeyShares
          : {
            ...state.secrets.boxKeyShares,
            [boxId]: {
              value: keyShare,
            },
          }
      ),
    },
  };
}

const removeBoxSecretKeys = (state, { secretKeys }) => ({
  ...state,
  secrets: {
    ...state.secrets,
    boxDecryptionKeys: without(state.secrets.boxDecryptionKeys, ...secretKeys),
  },
});

function importSecretKeys(state, { secretKeys }) {
  return concatToPath(secretKeys, state, ['secrets', 'passive', 'secretKeys']);
}

const removeBoxKeyShares = (state, { boxIds }) => ({
  ...state,
  secrets: {
    ...state.secrets,
    boxKeyShares: omit(state.secrets.boxKeyShares, boxIds),
  },
});

const setIdentityKey = (state, { identityId, secretKey, publicKey }) => ({
  ...state,
  secrets: {
    ...state.secrets,
    identityKeys: {
      publicKeys: {
        ...state.secrets.identityKeys.publicKeys,
        [identityId]: publicKey,
      },
      secretKeys: {
        ...state.secrets.identityKeys.publicKeys,
        [publicKey]: secretKey,
      },
    },
  },
});



const setIdentityNonIdentifiedKey = (state, { identityId, secretKey, publicKey }) => ({
  ...state,
  secrets: {
    ...state.secrets,
    identityNonIdentifiedKeys: {
      publicKeys: {
        ...state.secrets.identityNonIdentifiedKeys.publicKeys,
        [identityId]: publicKey,
      },
      secretKeys: {
        ...state.secrets.identityNonIdentifiedKeys.publicKeys,
        [publicKey]: secretKey,
      },
    },
  },
});

// REDUCER
const cryptoReducer = createReducer(INITIAL_STATE, {
  [CRYPTO_SET_BACKUP_KEY]: setBackupKey,
  [CRYPTO_SET_ENCRYPTED_BACKUP_DATA]: setEncryptedBackupData,
  [CRYPTO_SET_BACKUP_VERSION]: setEncryptedBackupVersion,
  [CRYPTO_INITIALIZE]: initialize,
  [CRYPTO_LOAD_SECRETS]: loadSecrets,
  [CRYPTO_SET_BOX_SECRETS]: setBoxSecrets,
  [CRYPTO_REMOVE_BOX_SECRET_KEYS]: removeBoxSecretKeys,
  [CRYPTO_IMPORT_SECRET_KEYS]: importSecretKeys,
  [CRYPTO_SET_BACKUP_KEY_SHARE]: setBackupKeyShare,
  [CRYPTO_REMOVE_BOX_KEY_SHARES]: removeBoxKeyShares,
  [CRYPTO_SET_VAULT_KEY]: setVaultKey,
  [SIGN_OUT]: reset,
  [CRYPTO_SET_IDENTITY_KEY]: setIdentityKey,
  [CRYPTO_SET_IDENTITY_NON_IDENTIFIED_KEYS]: setIdentityNonIdentifiedKey,
});

export default persistReducer(
  { key: 'crypto', storage, whitelist: ['backupKeyShares'], blacklist: [] },
  cryptoReducer,
);
