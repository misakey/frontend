import {
  postAsymKeyToSecretStorage,
  postBoxKeyShareToSecretStorage,
} from '@misakey/core/crypto/HttpApi';
import {
  saltedSymmetricEncrypt,
  saltedSymmetricDecrypt,
  symmetricEncrypt,
  symmetricDecrypt,
  keyPairFromSecretKey,
} from '@misakey/core/crypto/crypto';
import {
  hashShare,
} from '@misakey/core/crypto/crypto/keySplitting';
import {
  serializeObjectToJson,
  deserializeJsonToObject,
} from '@misakey/core/crypto/helpers/serialization';
import {
  decodeUTF8,
  encodeUTF8,
} from 'tweetnacl-util';
import { decodeBase64, encodeBase64 } from '@misakey/core/crypto/helpers/base64';
import { hash } from '@misakey/core/crypto/crypto/hashing';

export function encryptRootKey(rootKey, passwordHash) {
  const keyBytes = decodeBase64(rootKey, { urlSafe: true });
  const encrypted = saltedSymmetricEncrypt(keyBytes, passwordHash);
  return encodeBase64(decodeUTF8(encrypted), { urlSafe: true });
}

async function decryptRootKey(encryptedRootKey, password) {
  const encrypted = encodeUTF8(
    decodeBase64(
      encryptedRootKey,
      { urlSafe: true },
    ),
  );

  const {
    plaintext: keyBytes,
  } = await saltedSymmetricDecrypt(encrypted, password);

  return encodeBase64(keyBytes, { urlSafe: true });
}

export function encryptSecretWithRootKey(secret, rootKey) {
  const bytes = decodeBase64(secret, { urlSafe: true });
  const encrypted = symmetricEncrypt(bytes, rootKey);
  return encodeBase64(
    decodeUTF8(
      serializeObjectToJson(
        encrypted,
      ),
    ),
    { urlSafe: true },
  );
}

export function decryptSecretWithRootKey(encryptedSecret, rootKey) {
  const {
    ciphertext,
    nonce,
  } = deserializeJsonToObject(
    encodeUTF8(
      decodeBase64(
        encryptedSecret,
        { urlSafe: true },
      ),
    ),
  );
  const bytes = symmetricDecrypt(ciphertext, nonce, rootKey);
  return encodeBase64(bytes, { urlSafe: true });
}

export async function uploadAsymKeyForStorage({ secretKey, rootKey }) {
  const payload = {
    // many times the caller does not have the public key
    // so it's okay to re-compute it here
    publicKey: keyPairFromSecretKey(secretKey).publicKey,
    encryptedSecretKey: encryptSecretWithRootKey(secretKey, rootKey),
    accountRootKeyHash: hash(rootKey),
  };
  return postAsymKeyToSecretStorage(payload);
}

export async function uploadBoxKeyShareForStorage({ boxId, share, rootKey }) {
  const payload = {
    invitationShareHash: hashShare(share),
    encryptedInvitationShare: encryptSecretWithRootKey(share, rootKey),
    accountRootKeyHash: hash(rootKey),
  };
  return postBoxKeyShareToSecretStorage({ boxId, payload });
}

export function decryptSecretStorageWithRootKey(encryptedSecretStorage, rootKey) {
  const {
    vaultKey: {
      encryptedKey: encryptedVaultKey,
    },
    asymKeys: encryptedAsymKeys,
    boxKeyShares: encryptedBoxKeyShares,
  } = encryptedSecretStorage;

  const asymKeys = (
    Object.fromEntries(Object.entries(encryptedAsymKeys).map(([publicKey, obj]) => {
      const secretKey = decryptSecretWithRootKey(obj.encryptedSecretKey, rootKey);
      return [publicKey, secretKey];
    }))
  );

  const boxKeyShares = (
    Object.fromEntries(Object.entries(encryptedBoxKeyShares).map(([boxId, obj]) => {
      const invitationShare = decryptSecretWithRootKey(obj.encryptedInvitationShare, rootKey);
      return [boxId, invitationShare];
    }))
  );

  return {
    rootKey,
    vaultKey: decryptSecretWithRootKey(encryptedVaultKey, rootKey),
    asymKeys,
    boxKeyShares,
  };
}

export async function decryptSecretStorageWithPassword(encryptedSecretStorage, password) {
  const {
    accountRootKey: {
      encryptedKey: encryptedRootKey,
    },
  } = encryptedSecretStorage;

  const rootKey = await decryptRootKey(encryptedRootKey, password);

  return decryptSecretStorageWithRootKey(encryptedSecretStorage, rootKey);
}
