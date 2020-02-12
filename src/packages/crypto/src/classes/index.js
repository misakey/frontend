import {
  decodeUTF8, encodeUTF8,
} from 'tweetnacl-util';

import pick from '@misakey/helpers/pick';
import isNil from '@misakey/helpers/isNil';

import {
  getSecretsBackup,
  updateSecretsBackup,
  postChannels,
  getCryptograms,
  postCryptograms,
} from '../HttpApi';
import {
  generateAsymmetricKeyPair,
  generateNewSaltedSymmetricKey,
  asymmetricEncrypt,
  asymmetricDecrypt,
} from '../crypto';
import {
  encryptSecretsBackup,
  decryptSecretsBackup,
} from '../BackupEncryption';

import {
  ContextStore,
} from './ContextStore';

export class OwnerCryptoContext {
  constructor() {
    this.hasCryptoReady = false;
    this.store = new ContextStore();
  }

  signOut() {
    this.hasCryptoReady = false;
    this.store = new ContextStore();
  }

  // must be called by application code before more or less any operation can be done
  // (recall, application code cannot call the constructor
  // because it imports an instance)
  initialize(ownerId) {
    this.store.ownerId = ownerId;
  }

  assertCryptoReady() {
    if (!this.hasCryptoReady) {
      throw Error('crypto context secrets have not been initialized or loaded '
                + '(this.hasCryptoReady is false)');
    }
  }

  assertCryptoHasNotBeenSetup() {
    if (this.hasCryptoReady) {
      throw Error('crypto context secrets have already been initialized or loaded '
                + '(this.hasCryptoReady is true)');
    }
  }

  assertHasBeenInitialized() {
    if (!this.store.ownerId) {
      throw Error('crypto context has not been initialized');
    }
  }

  async updateSecretBackupOnServer() {
    const encryptedSecrets = encryptSecretsBackup(this.store.secrets, this.backupKey);
    await updateSecretsBackup(this.store.ownerId, encryptedSecrets);
  }

  /*
   * Method will fetch the encrypted secret backup
   * only if parameter encryptedSecretsBackup is not provided.
   * This allows application code to manage fetching by itself,
   * typically to avoid re-fetching every time we have a decryption error
   * (for instance if the user enters the wrong password)
   */
  async loadSecretBackup(password, encryptedSecretsBackupOrNil) {
    this.assertCryptoHasNotBeenSetup();

    let encryptedSecretsBackup;
    if (isNil(encryptedSecretsBackupOrNil)) {
      this.assertHasBeenInitialized();
      encryptedSecretsBackup = await getSecretsBackup(this.store.ownerId);
    } else {
      encryptedSecretsBackup = encryptedSecretsBackupOrNil;
    }

    const {
      backupKey,
      secretBackup,
    } = await decryptSecretsBackup(encryptedSecretsBackup, password);

    this.store.secrets = secretBackup;
    this.backupKey = backupKey;

    this.hasCryptoReady = true;
  }

  async createNewChannel(datatype) {
    const { secretKey, publicKey } = generateAsymmetricKeyPair();

    this.store.secrets.channelKeys[datatype] = { initialChannel: { secretKey } };
    await this.updateSecretBackupOnServer();

    this.store.channelsPublicInfo[datatype] = { publicKey };
    const channel = {
      owner_user_id: this.store.ownerId,
      datatype,
      public_key: publicKey,
    };
    // @FIXME add a method to check consistency between secret channel keys we have
    // and public channel keys on server
    // (see https://gitlab.misakey.dev/misakey/js-common/issues/38)
    const [{ id: dataChannelId }] = await postChannels([channel]);
    this.store.channelsPublicInfo[datatype].id = dataChannelId;
  }

  async hardPasswordChange(newPassword) {
    const { secretKey, publicKey } = generateAsymmetricKeyPair();
    // TODO re-create all active channels in MK Data
    // (right now calling hardPasswordChange
    // simply breaks MK Data protocol)

    const secrets = {
      secretKey,
    };

    const backupKey = await generateNewSaltedSymmetricKey(newPassword);

    const encryptedSecrets = encryptSecretsBackup(secrets, backupKey);

    // @FIXME if call to server fails
    // maybe we should not put the values in store
    // and consider crypto as "ready";
    // that said if the call to the server fails
    // the application code will probably retry and not continue
    this.store.secrets = secrets;
    this.store.publicKey = publicKey;
    this.backupKey = backupKey;
    this.hasCryptoReady = true;

    // returning data
    // following the format of the HTTP API
    // (see backend swagger doc for hard password reset)
    // in order to be nice to application code
    return {
      backupData: encryptedSecrets,
      pubkeys: {
        userPubkey: publicKey,
      },
    };
  }

  async createNewOwnerSecrets(password, avoidOverwritingSecrets = false) {
    // no need to have initialized the context
    // (that is, to have provided the user id)
    if (avoidOverwritingSecrets) {
      this.assertCryptoHasNotBeenSetup();
    }

    const { secretKey, publicKey } = generateAsymmetricKeyPair();
    // this.store is not a literal object but an instance of ContextStore
    // so we must not do "this.store = { ... }"
    // even if it's tempting
    this.store.secrets = {
      secretKey,
      channelKeys: {},
    };
    this.store.publicKey = publicKey;

    this.backupKey = await generateNewSaltedSymmetricKey(password);

    this.hasCryptoReady = true;

    const encryptedSecrets = encryptSecretsBackup(this.store.secrets, this.backupKey);
    return {
      backupData: encryptedSecrets,
      pubkeyData: publicKey,
    };
  }

  // changes will not be effective
  // until commitBackupKeyUpdate is called
  async prepareBackupKeyUpdate(newPassword, oldPassword, ownerId) {
    delete this.preparedBackupKey;
    if (!this.hasCryptoReady) {
      // @FIXME connect crypto to redux store
      // to simplify access to things like ownerId
      if (!this.store.ownerId) {
        this.initialize(ownerId);
      }
      await this.loadSecretBackup(oldPassword);
    }
    this.preparedBackupKey = await generateNewSaltedSymmetricKey(newPassword);
    const encryptedSecrets = encryptSecretsBackup(this.store.secrets, this.preparedBackupKey);
    return {
      backupData: encryptedSecrets,
    };
  }

  // Alias
  preparePasswordChange = this.prepareBackupKeyUpdate

  commitBackupKeyUpdate() {
    this.backupKey = this.preparedBackupKey;
    delete this.preparedBackupKey;
  }

  // Alias
  commitPasswordChange = this.commitBackupKeyUpdate

  async makeSureDatatypesAreInitialized(datatypes) {
    this.assertHasBeenInitialized();
    this.assertCryptoReady();

    const promises = datatypes.map(async (datatype) => {
      const alreadyInit = Boolean(this.store.secrets.channelKeys[datatype]);
      if (!alreadyInit) { await this.createNewChannel(datatype); }
    });
    await Promise.all(promises);
  }

  // just an alias that should be more meaningful for application developers
  // when working with data producers
  onConnectToAProducer = this.makeSureDatatypesAreInitialized;

  async getDataPoints(datatypes, fromDatetime, toDatetime) {
    this.assertHasBeenInitialized();
    this.assertCryptoReady();
    const retrieved = await getCryptograms(this.store.ownerId, datatypes, fromDatetime, toDatetime);
    return retrieved.map((result) => {
      const channelSecretKey = this.store.getChannelSecretKey(result.datatype);
      const decrypted = asymmetricDecrypt(result.content, channelSecretKey);
      return JSON.parse(encodeUTF8(decrypted));
    });
  }

  // @FIXME LATER allow an array of data points
  async encryptAndUploadDataPoint(dataPoint) {
    this.assertHasBeenInitialized();
    const { datatype } = dataPoint.metadata;
    const {
      publicKey: channelPublicKey,
      id: dataChannelId,
    } = await this.store.getChannelPublicInfo(datatype);
    // we are whitelisting the metadata fields that will be included in the cryptogram,
    // that is the fields that will be seeable by any entity decrypting a cryptogram.
    // for instance we don't include the data producer (field producerApplicationId)
    // because we don't want data consumers to see it.
    // @FIXME maybe this should be defined at another level
    // instead of being burried here in the code
    const metadataFieldsToIncludeInCryptogram = [
      'datatype',
      'dataTimestamp',
    ];
    const toEncrypt = {
      ...dataPoint,
      metadata: pick(dataPoint.metadata, metadataFieldsToIncludeInCryptogram),
    };
    const cryptogram = asymmetricEncrypt(
      decodeUTF8(JSON.stringify(toEncrypt)),
      channelPublicKey,
    );
    const cryptogramMetadata = {
      ...dataPoint.metadata,
      dataChannelId,
    };
    // we pass an array where each element (here one element)
    // is a couple (cryptogram, cryptogramMetadata)
    await postCryptograms([[cryptogram, cryptogramMetadata]]);
  }
}
