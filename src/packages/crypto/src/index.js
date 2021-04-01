import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import pathOr from '@misakey/core/helpers/pathOr';
import path from '@misakey/core/helpers/path';

import {
  generateSymmetricKey,
  keyPairFromSecretKey,
  generateNewSaltedSymmetricKey,
} from '@misakey/crypto/crypto';
import { generateVaultKey } from '@misakey/crypto/vault';
import {
  generateIdentityKeyPair,
  generateIdentityNonIdentifiedKeyPair,
} from '@misakey/crypto/cryptoactions';
import {
  hashShare,
} from '@misakey/crypto/crypto/keySplitting';
import {
  decryptSecretsBackup,
} from '@misakey/crypto/secretsBackup/encryption';
import {
  encryptSecretWithRootKey,
  encryptRootKey,
} from '@misakey/crypto/secretStorage';
import { hash } from '@misakey/crypto/crypto/hashing';

import { INITIAL_STATE } from './store/reducers';

/**
 * Turns an empty or possibly incomplete account crypto
 * into a valid, complete one.
 */
function setupAccountCrypto({
  currentState,
  identityPublicKeys,
  identityNonIdentifiedPublicKeys,
}) {
  const state = {
    ...INITIAL_STATE,
    ...currentState,
  };
  const toCreate = {};

  if (isNil(state.secretStorage.rootKey)) {
    state.secretStorage.rootKey = generateSymmetricKey();
  }

  if (isNil(state.secretStorage.vaultKey)) {
    state.secretStorage.vaultKey = generateVaultKey();
  }

  if (isEmpty(identityPublicKeys)) {
    const { publicKey, secretKey } = generateIdentityKeyPair();

    toCreate.newIdentityPublicKey = publicKey;

    state.secretStorage.asymKeys = {
      ...state.secretStorage.asymKeys,
      [publicKey]: secretKey,
    };
  }

  if (isEmpty(identityNonIdentifiedPublicKeys)) {
    const { publicKey, secretKey } = generateIdentityNonIdentifiedKeyPair();

    toCreate.newIdentityNonIdentifiedPublicKey = publicKey;

    state.secretStorage.asymKeys = {
      ...state.secretStorage.asymKeys,
      [publicKey]: secretKey,
    };
  }

  return {
    state,
    ...toCreate,
  };
}

const hashPassword = generateNewSaltedSymmetricKey;

/**
 * Encrypts the state and present it for crypto-reset endpoints
 * (account creation, account migration, password reset)
 */
function makeCryptoResetPayload({
  passwordHash,
  state,
  newIdentityPublicKey,
  newIdentityNonIdentifiedPublicKey,
}) {
  const {
    secretStorage: {
      rootKey,
      vaultKey,
      asymKeys,
      boxKeyShares,
    },
  } = state;

  const payload = {
    accountRootKey: {
      keyHash: hash(rootKey),
      encryptedKey: encryptRootKey(rootKey, passwordHash),
    },
    vaultKey: {
      keyHash: hash(rootKey),
      encryptedKey: encryptSecretWithRootKey(vaultKey, rootKey),
    },
    asymKeys: {},
    boxKeyShares: {},
    // backend use these names instead
    // TODO make naming consistent
    // (see refacto list: https://gitlab.misakey.dev/misakey/frontend/-/issues/856)
    pubkey: newIdentityPublicKey,
    nonIdentifiedPubkey: newIdentityNonIdentifiedPublicKey,
  };

  Object.entries(asymKeys).forEach(([publicKey, secretKey]) => {
    payload.asymKeys[publicKey] = {
      encryptedSecretKey: encryptSecretWithRootKey(secretKey, rootKey),
    };
  });

  Object.entries(boxKeyShares).forEach(([boxId, share]) => {
    payload.boxKeyShares[boxId] = {
      invitationShareHash: hashShare(share),
      encryptedInvitationShare: encryptSecretWithRootKey(share, rootKey),
    };
  });

  return payload;
}

export async function accountCreationSecretStoragePayload(password) {
  const {
    newIdentityPublicKey,
    newIdentityNonIdentifiedPublicKey,
    state,
  } = setupAccountCrypto({});

  const passwordHash = await hashPassword(password);

  const payload = makeCryptoResetPayload({
    passwordHash,
    state,
    newIdentityPublicKey,
    newIdentityNonIdentifiedPublicKey,
  });

  return payload;
}

export const passwordResetSecretStoragePayload = accountCreationSecretStoragePayload;

export async function encryptRootKeyWithNewPassword(rootKey, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  return encryptRootKey(rootKey, passwordHash);
}

function transformDecryptedSecretBackup({ secrets }) {
  const currentState = {
    secretStorage: {
      vaultKey: null,
      asymKeys: {},
      boxKeyShares: {},
    },
  };
  const identityPublicKeys = [];
  const identityNonIdentifiedPublicKeys = [];

  currentState.secretStorage.vaultKey = secrets.vaultKey;

  const boxDecryptionKeys = pathOr([], ['boxDecryptionKeys'], secrets);
  boxDecryptionKeys.forEach((secretKey) => {
    const { publicKey } = keyPairFromSecretKey(secretKey);
    currentState.secretStorage.asymKeys[publicKey] = secretKey;
  });

  const boxKeyShares = Object.entries(pathOr({}, ['boxKeyShares'], secrets));
  boxKeyShares.forEach(([boxId, shareObj]) => {
    const share = path(['value'], shareObj);
    if (isNil(share)) return;
    currentState.secretStorage.boxKeyShares[boxId] = share;
  });

  const identityKeys = Object.entries(pathOr({}, ['identityKeys', 'secretKeys'], secrets));
  identityKeys.forEach(([publicKey, secretKey]) => {
    currentState.secretStorage.asymKeys[publicKey] = secretKey;
    identityPublicKeys.push(publicKey);
  });

  const identityNonIdentifiedKeys = Object.entries(pathOr({}, ['identityNonIdentifiedKeys', 'secretKeys'], secrets));
  identityNonIdentifiedKeys.forEach(([publicKey, secretKey]) => {
    currentState.secretStorage.asymKeys[publicKey] = secretKey;
    identityNonIdentifiedPublicKeys.push(publicKey);
  });

  return {
    currentState,
    identityPublicKeys,
    identityNonIdentifiedPublicKeys,
  };
}

export async function computeCryptoMigration({ encryptedSecretsBackup, password }) {
  const {
    backupKey: passwordHash,
    secretBackup: secrets,
  } = await decryptSecretsBackup(encryptedSecretsBackup, password);

  const {
    currentState,
    identityPublicKeys,
    identityNonIdentifiedPublicKeys,
  } = transformDecryptedSecretBackup({ secrets });

  const {
    state,
    newIdentityPublicKey,
    newIdentityNonIdentifiedPublicKey,
  } = setupAccountCrypto({
    currentState,
    identityPublicKeys,
    identityNonIdentifiedPublicKeys,
  });

  const migrationPayload = makeCryptoResetPayload({
    passwordHash,
    state,
    newIdentityPublicKey,
    newIdentityNonIdentifiedPublicKey,
  });

  return {
    migrationPayload,
    secretStorage: state.secretStorage,
  };
}
