/* This file adds serialization and base64 encoding/decoding over core.js
*/

import log from '@misakey/helpers/log';
import assertNotAnyNil from '../helpers/assertNotAnyNil';

import {
  decodeBase64, encodeBase64,
} from '../helpers/base64';

import { encodeHex } from '../helpers/encodeHex';
import { BitFieldUnpacker } from '../helpers/BitFieldUnpacker';
import {
  serializeObjectToJson,
  deserializeJsonToObject,
} from '../helpers/serialization';

import * as core from './core';

const ASYMMETRIC_PACKING_VERSION = 2;

export function generateAsymmetricKeyPair() {
  const { secretKey, publicKey } = core.generateAsymmetricKeyPair();
  return {
    secretKey: encodeBase64(secretKey),
    publicKey: encodeBase64(publicKey),
  };
}

export function keyPairFromSecretKey(secretKey) {
  const keyPair = core.keyPairFromSecretKey(decodeBase64(secretKey));
  return {
    secretKey: encodeBase64(keyPair.secretKey),
    publicKey: encodeBase64(keyPair.publicKey),
  };
}

export function asymmetricEncrypt(plaintext, recipientPublicKey, options = {}) {
  assertNotAnyNil({ plaintext, recipientPublicKey });
  const cryptogram = core.asymmetricEncrypt(plaintext, decodeBase64(recipientPublicKey));
  if (options.includeRecipientPublicKey) {
    cryptogram.recipientPublicKey = decodeBase64(recipientPublicKey);
  }
  return serializeObjectToJson(cryptogram);
}

export function asymmetricDecrypt(cryptogram, recipientSecretKey) {
  assertNotAnyNil({ cryptogram, recipientSecretKey });
  if (typeof cryptogram !== 'string') {
    throw Error(`cryptogram must be a string, not ${typeof cryptogram}`);
  }

  let ciphertext;
  let nonce;
  let recipientPublicKey;
  let ephemeralSenderPublicKey;

  try {
    ({
      ciphertext,
      nonce,
      recipientPublicKey,
      ephemeralSenderPublicKey,
    } = deserializeJsonToObject(cryptogram));
  } catch (e) {
    const unpacker = new BitFieldUnpacker(decodeBase64(cryptogram));
    const packingVersion = unpacker.getPackingVersion();
    if (packingVersion !== ASYMMETRIC_PACKING_VERSION) {
      throw Error(`bad version byte : ${packingVersion}`);
    }

    ephemeralSenderPublicKey = unpacker.unpackFromLenghtByte();
    recipientPublicKey = unpacker.unpackOptionalFromLenghtByte();
    nonce = unpacker.unpackFromLenghtByte();
    ciphertext = unpacker.unpackRemainingBytes();

    log(`deserialized using ad-hoc bit packing: ${cryptogram} (in asymmetricDecrypt)`, 'info');
  }


  return core.asymmetricDecrypt(
    ciphertext,
    nonce,
    decodeBase64(recipientSecretKey),
    recipientPublicKey,
    ephemeralSenderPublicKey,
  );
}

export function saltedSymmetricEncrypt(plaintext, saltedSymmetricKey) {
  const cryptogram = core.saltedSymmetricEncrypt(plaintext, saltedSymmetricKey);
  return serializeObjectToJson(cryptogram);
}

export async function saltedSymmetricDecrypt(cryptogram, lowEntropySecret) {
  if (typeof cryptogram !== 'string') {
    throw Error(`cryptogram must be a string, not ${typeof cryptogram}`);
  }

  let nonce;
  let salt;
  let ciphertext;

  try {
    ({
      nonce,
      salt,
      ciphertext,
    } = deserializeJsonToObject(cryptogram));
  } catch (e) {
    const unpacker = new BitFieldUnpacker(decodeBase64(cryptogram));
    const packingVersion = unpacker.getPackingVersion();
    if (packingVersion !== 1) {
      throw Error(`bad version byte : ${packingVersion}`);
    }

    nonce = unpacker.unpackFromLenghtByte();
    salt = encodeHex(unpacker.unpackFromLenghtByte());
    ciphertext = unpacker.unpackRemainingBytes();

    log(`deserialized using ad-hoc bit packing: ${cryptogram} (in saltedSymmetricDecrypt)`, 'info');
  }

  return core.saltedSymmetricDecrypt(nonce, salt, ciphertext, lowEntropySecret);
}

// symmetric keys are never sent over the network
// so we don't base64-encode them,
// although we could (bytes are not nice to console.log)
export const {
  deriveSymmetricKeyFromLowEntropySecret,
  generateNewSaltedSymmetricKey,
} = core;
