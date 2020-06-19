import merge from '@misakey/helpers/merge';
import ramdaPath from '@misakey/helpers/path';
import assocPath from '@misakey/helpers/assocPath';
import { createSelector } from 'reselect';
// WARNING this "pick" from Ramda, not from Lodash!
import pick from '@misakey/helpers/pick';
import isNil from '@misakey/helpers/isNil';

import { SIGN_OUT } from '@misakey/auth/store/actions/auth';

import {
  CRYPTO_LOAD_SECRETS,
  CRYPTO_SET_BACKUP_KEY,
  CRYPTO_IMPORT_SECRET_KEYS,
  CRYPTO_INITIALIZE,
  CRYPTO_SET_BACKUP_VERSION,
  CRYPTO_ADD_BOX_SECRET_KEY,
} from './actions/concrete';

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

// REDUCERS

const initialState = {
  backupKey: null,
  backupVersion: null,
  secrets: {
    // @FIXME rename "secretKey" to "userDecryptionKey"
    secretKey: null,
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

export default function (currentState = initialState, action) {
  let newState = { ...currentState };

  switch (action.type) {
    case SIGN_OUT:
      return initialState;
    case CRYPTO_SET_BACKUP_KEY:
      return {
        ...newState,
        backupKey: action.backupKey,
      };
    case CRYPTO_SET_BACKUP_VERSION:
      return {
        ...newState,
        backupVersion: action.version,
      };
    case CRYPTO_INITIALIZE:
      newState.secrets.secretKey = action.secretKey;
      newState.backupKey = action.backupKey;
      return newState;
    case CRYPTO_LOAD_SECRETS:
      return merge(
        { ...initialState },
        pick(['secrets', 'backupKey', 'backupVersion'], action),
      );

    case CRYPTO_ADD_BOX_SECRET_KEY:
      newState.secrets.boxDecryptionKeys = [
        ...newState.secrets.boxDecryptionKeys,
        action.secretKey,
      ];
      return newState;
    case CRYPTO_IMPORT_SECRET_KEYS:
      // the reducer does not perform any checks:
      // it is the action that is responsible
      // for filtering the keys we are adding
      newState = concatToPath(action.secretKeys, newState, ['secrets', 'passive', 'secretKeys']);
      return newState;
    default:
      return currentState;
  }
}

// SELECTORS
const getState = (state) => state.crypto;

const isCryptoLoaded = createSelector(
  getState,
  (state) => !isNil(state.backupKey),
);

export const selectors = {
  isCryptoLoaded,
};
