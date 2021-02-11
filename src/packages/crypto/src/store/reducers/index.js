import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import isNil from '@misakey/helpers/isNil';
import merge from '@misakey/helpers/merge';
import ramdaPath from '@misakey/helpers/path';
import assocPath from '@misakey/helpers/assocPath';
import propOr from '@misakey/helpers/propOr';
import omit from '@misakey/helpers/omit';
import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { createSelector } from 'reselect';

import {
  keyPairFromSecretKey,
} from '@misakey/crypto/crypto';

import { SIGN_OUT } from '@misakey/react-auth/store/actions/auth';

import {
  CRYPTO_LOAD_SECRETS,
  CRYPTO_IMPORT_SECRET_KEYS,
  CRYPTO_SET_BOX_SECRETS,
  CRYPTO_SET_ENCRYPTED_SECRET_STORAGE_DATA,
  CRYPTO_SET_ROOT_KEY_SHARE,
  CRYPTO_SET_VAULT_KEY,
  CRYPTO_SET_IDENTITY_KEY,
  CRYPTO_SET_IDENTITY_NON_IDENTIFIED_KEYS,
  CRYPTO_DELETE_SECRETS,
} from '../actions/types';

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
  rootKeyShares: {},
  data: null,
  secretStorage: {
    rootKey: null,
    vaultKey: null,
    asymKeys: {},
    boxKeyShares: {},
  },
};

// SELECTORS
const getState = (state) => state.crypto;

const isCryptoLoaded = createSelector(
  getState,
  (state) => !isNil(state.secretStorage.rootKey),
);

const getAsymKeys = (state) => getState(state).secretStorage.asymKeys;

const getAsymSecretKey = (publicKey) => (state) => (
  getState(state).secretStorage.asymKeys[publicKey]
);

const getBoxKeyShares = (state) => getState(state).secretStorage.boxKeyShares;

const getBoxKeyShare = (boxId) => (state) => (
  getState(state).secretStorage.boxKeyShares[boxId]
);

const getRootKey = createSelector(
  getState,
  (state) => state.secretStorage.rootKey,
);

const getVaultKey = createSelector(
  getState,
  (state) => state.secretStorage.vaultKey,
);

const makeGetRootKeyShareForAccount = () => createSelector(
  (state) => getState(state).rootKeyShares,
  (_, accountId) => accountId,
  (items, accountId) => propOr(null, accountId)(items),
);

const getEncryptedSecretStorageData = createSelector(
  getState,
  (state) => ({ data: state.data }),
);

export const selectors = {
  getAsymKeys,
  getAsymSecretKey,
  getBoxKeyShares,
  getBoxKeyShare,
  getRootKey,
  getVaultKey,
  makeGetRootKeyShareForAccount,
  isCryptoLoaded,
  getEncryptedSecretStorageData,
};


// ACTION HANDLERS

function reset() {
  return INITIAL_STATE;
}

function setVaultKey(state, { vaultKey }) {
  return {
    ...state,
    secretStorage: {
      ...state.secretStorage,
      vaultKey,
    },
  };
}

function setRootKeyShare(state, { rootKeyShare, accountId }) {
  return {
    ...state,
    rootKeyShares: {
      ...state.rootKeyShares,
      [accountId]: rootKeyShare,
    },
  };
}


function setEncryptedSecretStorageData(state, { data }) {
  return {
    ...state,
    data,
  };
}

function loadSecrets(state, { secretStorage }) {
  return {
    ...state,
    secretStorage: merge(state.secretStorage, secretStorage),
  };
}

function setAsymKey(state, { secretKey }) {
  const { publicKey } = keyPairFromSecretKey(secretKey);

  return {
    ...state,
    secretStorage: {
      ...state.secretStorage,
      asymKeys: {
        ...state.secretStorage.asymKeys,
        [publicKey]: secretKey,
      },
    },
  };
}

function setBoxKeyShare(state, { boxId, keyShare }) {
  return {
    ...state,
    secretStorage: {
      ...state.secretStorage,
      boxKeyShares: {
        ...state.secretStorage.boxKeyShares,
        [boxId]: keyShare,
      },
    },
  };
}

function setBoxSecrets(state, { boxId, secretKey, keyShare }) {
  let newState = state;

  if (!isNil(secretKey)) {
    newState = setAsymKey(newState, { secretKey });
  }

  if (!isNil(keyShare)) {
    if (isNil(boxId)) {
      throw Error('box ID is required to set a box key share');
    }
    newState = setBoxKeyShare(newState, { boxId, keyShare });
  }

  return newState;
}

function importSecretKeys(state, { secretKeys }) {
  return concatToPath(secretKeys, state, ['secrets', 'passive', 'secretKeys']);
}

const deleteSecrets = (state, { asymPublicKeys, boxKeySharesBoxIds }) => ({
  ...state,
  secretStorage: {
    ...state.secretStorage,
    asymKeys: omit(state.secretStorage.asymKeys, asymPublicKeys),
    boxKeyShares: omit(state.secretStorage.boxKeyShares, boxKeySharesBoxIds),
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
  [CRYPTO_SET_ENCRYPTED_SECRET_STORAGE_DATA]: setEncryptedSecretStorageData,
  [CRYPTO_LOAD_SECRETS]: loadSecrets,
  [CRYPTO_SET_BOX_SECRETS]: setBoxSecrets,
  [CRYPTO_DELETE_SECRETS]: deleteSecrets,
  [CRYPTO_IMPORT_SECRET_KEYS]: importSecretKeys,
  [CRYPTO_SET_ROOT_KEY_SHARE]: setRootKeyShare,
  [CRYPTO_SET_VAULT_KEY]: setVaultKey,
  [SIGN_OUT]: reset,
  [CRYPTO_SET_IDENTITY_KEY]: setIdentityKey,
  [CRYPTO_SET_IDENTITY_NON_IDENTIFIED_KEYS]: setIdentityNonIdentifiedKey,
});

export default persistReducer(
  { key: 'crypto', storage, whitelist: ['rootKeyShares'], blacklist: [] },
  cryptoReducer,
);
