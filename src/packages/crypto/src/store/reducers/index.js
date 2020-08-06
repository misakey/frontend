import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import isNil from '@misakey/helpers/isNil';
import mergeWith from '@misakey/helpers/mergeWith';
import isArray from '@misakey/helpers/isArray';
import ramdaPath from '@misakey/helpers/path';
import assocPath from '@misakey/helpers/assocPath';
import propOr from '@misakey/helpers/propOr';
import omit from '@misakey/helpers/omit';
import pick from '@misakey/helpers/pick';
import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { createSelector } from 'reselect';

import { SIGN_OUT } from '@misakey/auth/store/actions/auth';

import { without } from 'lodash';
import {
  CRYPTO_LOAD_SECRETS,
  CRYPTO_SET_BACKUP_KEY,
  CRYPTO_IMPORT_SECRET_KEYS,
  CRYPTO_INITIALIZE,
  CRYPTO_SET_BACKUP_VERSION,
  CRYPTO_ADD_BOX_SECRET_KEY,
  CRYPTO_REMOVE_BOX_SECRET_KEYS,
  CRYPTO_SET_ENCRYPTED_BACKUP_DATA,
  CRYPTO_SET_BACKUP_KEY_SHARE,
  CRYPTO_SET_BOX_KEY_SHARE,
  CRYPTO_REMOVE_BOX_KEY_SHARES,
} from '../actions/concrete';


// HELPERS

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
    boxKeyShares: {},
    boxDecryptionKeys: [],
    // "passive" encryption keys are keys that must not be used any more for encrypting data;
    // they are only kept for decrypting data that was encrypted for them in the past.
    // This is typically used when recovering old keys that were retired after being lost.
    passive: {
      secretKeys: [],
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

const makeGetBackupKeyShareForAccount = () => createSelector(
  (state) => getState(state).backupKeyShares,
  (_, accountId) => accountId,
  (items, accountId) => propOr(null, accountId)(items),
);

const areSecretsLoaded = createSelector(
  getState,
  (state) => !isNil(state.secrets.secretKey),
);

const currentBoxSecrets = createSelector(
  getState,
  (state) => state.secrets.boxDecryptionKeys || [],
);

const getEncryptedBackupData = createSelector(
  getState,
  (state) => ({ data: state.data, backupVersion: state.backupVersion }),
);

const makeGetBoxKeyShare = () => createSelector(
  (state) => getState(state).secrets.boxKeyShares,
  (_, boxId) => boxId,
  (items, boxId) => propOr(null, boxId)(items),
);

const makeGetMissingBoxKeyShares = () => createSelector(
  (state) => getState(state).secrets.boxKeyShares,
  (_, ids) => ids,
  (items, ids) => omit(items, ids),
);

export const selectors = {
  getBackupKey,
  makeGetBackupKeyShareForAccount,
  isCryptoLoaded,
  areSecretsLoaded,
  currentBoxSecrets,
  getEncryptedBackupData,
  makeGetBoxKeyShare,
  makeGetMissingBoxKeyShares,
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


function initialize(state, { backupKey, secretKey }) {
  return {
    ...state,
    secrets: {
      ...state.secrets,
      secretKey,
    },
    backupKey,
  };
}

function loadSecrets(state, action) {
  return mergeWith(
    { ...state },
    pick(['secrets', 'backupKey', 'backupVersion'], action),
    (objValue, srcValue) => {
      if (isArray(objValue)) {
        return [...new Set(objValue.concat(srcValue))];
      }
      return undefined;
    },
  );
}


function addBoxSecretKey(state, { secretKey }) {
  return {
    ...state,
    secrets: {
      ...state.secrets,
      boxDecryptionKeys: [...new Set([secretKey].concat(state.secrets.boxDecryptionKeys))],
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

function setBoxKeyShare(state, { boxId, keyShare }) {
  return {
    ...state,
    secrets: {
      ...state.secrets,
      boxKeyShares: {
        ...state.secrets.boxKeyShares,
        [boxId]: keyShare,
      },
    },
  };
}

const removeBoxKeyShares = (state, { boxIds }) => ({
  ...state,
  secrets: {
    ...state.secrets,
    boxKeyShares: omit(state.secrets.boxKeyShares, boxIds),
  },
});

// REDUCER
const cryptoReducer = createReducer(INITIAL_STATE, {
  [CRYPTO_SET_BACKUP_KEY]: setBackupKey,
  [CRYPTO_SET_ENCRYPTED_BACKUP_DATA]: setEncryptedBackupData,
  [CRYPTO_SET_BACKUP_VERSION]: setEncryptedBackupVersion,
  [CRYPTO_INITIALIZE]: initialize,
  [CRYPTO_LOAD_SECRETS]: loadSecrets,
  [CRYPTO_ADD_BOX_SECRET_KEY]: addBoxSecretKey,
  [CRYPTO_REMOVE_BOX_SECRET_KEYS]: removeBoxSecretKeys,
  [CRYPTO_IMPORT_SECRET_KEYS]: importSecretKeys,
  [CRYPTO_SET_BACKUP_KEY_SHARE]: setBackupKeyShare,
  [CRYPTO_SET_BOX_KEY_SHARE]: setBoxKeyShare,
  [CRYPTO_REMOVE_BOX_KEY_SHARES]: removeBoxKeyShares,
  [SIGN_OUT]: reset,
});

export default persistReducer(
  { key: 'crypto', storage, whitelist: ['backupKeyShares'], blacklist: [] },
  cryptoReducer,
);
