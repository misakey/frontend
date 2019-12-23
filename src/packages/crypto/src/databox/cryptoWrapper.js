/* eslint-disable max-classes-per-file */

// A better name for this file would probably be "classes.js"
// as it implements a object-oriented API on top of the functions provided in the other files
// However we don't change its name because we avoid modifying this legacy code too much
// (MK Databox should be decomissionned when MK Data protocol can handle unstructured data)

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

import {
  SecretsNotLoadedOrCreated,
} from '../Errors/classes';

import {
  encryptBlobFile,
  decryptToJSBlob,
  keyPairFromSecretKey,
} from './crypto';

// note that we do not export the classes
// but instances of them
// (see at end of file)

export class ProducerCryptoContext {
  constructor() {
    this.owners = {};
  }

  addOwner(ownerId, ownerPublicKey) {
    if (!ownerId) { throw Error('ownerId is required'); }

    const owner = prop(ownerId, this.owners);
    if (!isNil(owner)) {
      throw Error('owner id is already present in state. '
        + 'To change the public key of this data owner, '
        + 'use method "setOwnerPublicKey" instead');
    }

    this.setOwnerPublicKey(ownerId, ownerPublicKey);
  }

  setOwnerPublicKey(ownerId, ownerPublicKey) {
    if (!ownerId) { throw Error('ownerId is required'); }
    if (!ownerPublicKey) { throw Error('ownerPublicKey is required'); }

    if (typeof ownerPublicKey !== 'string') { throw Error('ownerPublicKey must be a string'); }

    const owner = prop(ownerId, this.owners);

    if (!isNil(owner)) {
      this.owners[ownerId].publicKey = ownerPublicKey;
    } else {
      this.owners[ownerId] = {
        publicKey: ownerPublicKey,
      };
    }
  }

  encryptBlob(data, ownerId) {
    const owner = prop(ownerId, this.owners);

    if (!ownerId) { throw Error('ownerId is required'); }
    if (!data) { throw Error('data is required'); }

    if (isNil(owner)) { throw Error('unknown owner id; did you forget to add it?'); }
    if (!(data instanceof Blob)) { throw Error('data must be a JS Blob or File'); }

    const ownerPublicKey = this.owners[ownerId].publicKey;
    const promise = encryptBlobFile(data, ownerPublicKey)
      .then((encryptorResult) => ({
        ...encryptorResult,
        // databox protocol requires that
        // the owner public key that was used is included in the ciphertext
        ownerPublicKey,
      }));
    return promise;
  }
}

export class OwnerCryptoContext {
  constructor(store) {
    // store is located inside of new crypto SDK
    this.store = store;
  }

  getPublicKey() {
    return this.store.publicKey;
  }

  isReadyToDecrypt() {
    return Boolean(this.store.secrets) && Boolean(this.store.secrets.secretKey);
  }

  decryptBlob(ciphertext, nonce, ephemeralProducerPubKey) {
    if (!ciphertext) { throw Error('ciphertext is required'); }
    if (!nonce) { throw Error('nonce is required'); }
    if (!ephemeralProducerPubKey) { throw Error('ephemeralProducerPubKey is required'); }
    if (!this.isReadyToDecrypt()) { throw Error('not ready to decrypt, owner secrets must be loaded or created first'); }
    if (!(ciphertext instanceof Blob)) { throw Error('ciphertext must be a JS Blob or File'); }

    return decryptToJSBlob(
      ciphertext,
      nonce,
      ephemeralProducerPubKey,
      this.store.secrets.secretKey,
    );
  }

  getPublicKeysWeCanDecryptFrom() {
    if (!this.isReadyToDecrypt()) { throw new SecretsNotLoadedOrCreated(); }

    return [
      keyPairFromSecretKey(this.store.secrets.secretKey).publicKey,
    ];
  }

  shouldBlobBeDecryptable(blobOwnerPubKey) {
    const validPublicKeys = this.getPublicKeysWeCanDecryptFrom();
    return validPublicKeys.includes(blobOwnerPubKey);
  }
}
