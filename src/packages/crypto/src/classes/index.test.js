import {
  OwnerCryptoContext,
} from '.';

import {
  saltedSymmetricDecrypt,
  keyPairFromSecretKey,
} from '../crypto';

import {
  decryptSecretsBackup,
} from '../BackupEncryption';

import {
  BackupDecryptionError,
} from '../Errors/classes';

import '../testHelpers/argon2Mocking';

// this will also set variable "window.env" required by package API
import { buildJsonResponse } from '../testHelpers/http';

// Mocking fetch API
jest.spyOn(global, 'fetch');

// Constants for tests
const ownerId = 'owner123ThisShouldBeAnUUID';
const password = 'testpassword';
const datatype = 'unclassified_purchase';
const dataPoint = {
  metadata: {
    datatype,
    dataTimestamp: '2019-08-30 14:17',
    producerApplicationId: 'some UUID',
    inputSource: 'Google Takeout',
  },
  amount: 32,
  currency: 'EUR',
};

beforeEach(() => {
  fetch.mockReset();
});

describe('crypto context', () => {
  it('creates new owner secrets', async () => {
    let backup;
    let savedStore;
    {
      // instantiation and initialization must be done at two different times
      // because instanciation is done by the package
      // (app imports an instance, not a class)
      // and initialization is done by the app
      const cryptoContext = new OwnerCryptoContext();

      // calling "initialize" method is necessary
      // before *loading secrets*
      // but not before *creating new secrets*
      // (we don't have the owner user id available when we call createNewOwnerSecrets)

      ({
        backupData: backup,
      } = await cryptoContext.createNewOwnerSecrets(password));

      savedStore = cryptoContext.store;
    }

    // testing that the uploaded Backup
    // does restore the secrets
    const cryptoContext = new OwnerCryptoContext();
    cryptoContext.initialize(ownerId);
    fetch.mockResolvedValueOnce(buildJsonResponse({ data: backup }));
    await cryptoContext.loadSecretBackup(password);
    expect(cryptoContext.store.secrets).toEqual(savedStore.secrets);
  });

  it('creates new channels', async () => {
    // Setup

    const cryptoContext = new OwnerCryptoContext();
    cryptoContext.initialize(ownerId);
    cryptoContext.backupKey = {
      symmetricKey: new Uint8Array([
        111, 59, 153, 211, 204, 82, 129, 218, 117, 54, 241, 77, 224, 31, 207, 35,
        217, 126, 108, 225, 185, 225, 65, 67, 45, 63, 96, 128, 167, 71, 187, 232,
      ]),
      salt: '0d34286b192c332c9d92ab19498bd65e',
    };
    cryptoContext.store.secrets = {
      channelKeys: {},
    };
    cryptoContext.hasCryptoReady = true;

    // Actions

    fetch
      // response for the backup update
      .mockResolvedValueOnce(new Response())
      // response for the channel creation
      // (we only provide a channel id for now)
      .mockResolvedValueOnce(buildJsonResponse([{ id: 3 }]));
    await cryptoContext.onConnectToAProducer([datatype]);

    // Assertions

    const payload = JSON.parse(fetch.mock.calls[1][1].body);
    expect(payload[0]).toHaveProperty('owner_user_id', ownerId);
    expect(payload[0]).toHaveProperty('datatype', datatype);
    expect(payload[0]).toHaveProperty('public_key');
  });

  it('restores secrets by downloading backup from server', async () => {
    // Setup

    const cryptoContext = new OwnerCryptoContext();
    cryptoContext.initialize(ownerId);

    // Actions

    const backup = {
      data: 'ARgObl7lJW+XYoOtdIvHO26J7e6Ka9B1I7QQDTQoaxksMyydkqsZSYvWXrzhpw33DG0Dz9O53GYuLeoCVyiW3spzjVMBhH/DKJAEwfpwj5GQ6eNXBGw9/fkg6Wm2X2d8TXZyNgA57DGKsebDB2ZMLoooZqlKdd19XcJWkJfWAyOw/E2YNZlsOs6QrqLdH60lEeVjxZRHjqlxy8cM08IquN/emY7VjvKIrGEh+tca6U4rbgc9',
    };
    fetch.mockResolvedValueOnce(buildJsonResponse(backup));
    await cryptoContext.loadSecretBackup(password);

    // Assertions

    expect(cryptoContext.store.secrets).toEqual({
      channelKeys: {
        unclassified_purchase: {
          initialChannel: {
            secretKey: '4KIKYDNQ9PQyZjL28MxlQ/8hGtSG2sYHFq2hJEkFCw0=',
          },
        },
      },
    });
  });

  it('throws a BackupDecryptionError on bad password', async () => {
    // Setup

    const cryptoContext = new OwnerCryptoContext();
    cryptoContext.initialize(ownerId);

    // Actions & Assertions

    const backup = {
      data: 'ARgObl7lJW+XYoOtdIvHO26J7e6Ka9B1I7QQDTQoaxksMyydkqsZSYvWXrzhpw33DG0Dz9O53GYuLeoCVyiW3spzjVMBhH/DKJAEwfpwj5GQ6eNXBGw9/fkg6Wm2X2d8TXZyNgA57DGKsebDB2ZMLoooZqlKdd19XcJWkJfWAyOw/E2YNZlsOs6QrqLdH60lEeVjxZRHjqlxy8cM08IquN/emY7VjvKIrGEh+tca6U4rbgc9',
    };
    fetch.mockResolvedValueOnce(buildJsonResponse(backup));
    await expect(cryptoContext.loadSecretBackup('badPassword'))
      .rejects.toThrow(BackupDecryptionError);
  });

  test('can encrypt and upload data points', async () => {
    // Setup

    const cryptoContext = new OwnerCryptoContext();
    cryptoContext.initialize(ownerId);

    const mockedChannelId = 3;
    cryptoContext.store.channelsPublicInfo = {
      unclassified_purchase: {
        publicKey: '/x/nCX/6zm3MpZi4UmHU+8nifUGYLgtFtA13uYcIJXc=',
        id: mockedChannelId,
      },
    };
    cryptoContext.hasCryptoReady = true;

    // Actions

    fetch.mockResolvedValueOnce(new Response());
    await cryptoContext.encryptAndUploadDataPoint(dataPoint);

    // Assertions

    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(payload[0]).toHaveProperty('data_channel_id', mockedChannelId);
    expect(payload[0]).toHaveProperty('producer_application_id', dataPoint.metadata.producerApplicationId);
    expect(payload[0]).toHaveProperty('content');
    expect(payload[0]).toHaveProperty('data_timestamp', dataPoint.metadata.dataTimestamp);
    expect(payload[0]).toHaveProperty('input_source', dataPoint.metadata.inputSource);
  });

  it('retrieves public keys from server', async () => {
    // Setup

    const cryptoContext = new OwnerCryptoContext();
    cryptoContext.initialize(ownerId);
    cryptoContext.store.secrets = {
      channelKeys: {
        unclassified_purchase: {
          initialChannel: {
            secretKey: 'IQtuMW36ajan7ZXfW1TMgWuI0ZADt7Bbq8a4OoBWRvY=',
          },
        },
      },
    };
    const channel = {
      public_key: 'NywT3ad/NO8XitiMKOZO9cRbm8ajyDdfpdcD1dZhaFI=',
      datatype,
    };

    // Actions

    fetch.mockResolvedValueOnce(buildJsonResponse([channel]));
    const restoredPublicKey = (await cryptoContext.store.getChannelPublicInfo(datatype)).publicKey;

    // Assertions

    expect(restoredPublicKey).toEqual(channel.public_key);
  });

  it('downloads and decrypts cryptograms', async () => {
    // Setup

    const cryptoContext = new OwnerCryptoContext();
    cryptoContext.initialize(ownerId);
    cryptoContext.store.secrets = {
      channelKeys: {
        unclassified_purchase: {
          initialChannel: {
            secretKey: 'gcTBUyKahmz/pJvZsxp9mm9C5WBcaLmR1LAcW7kUIpc=',
          },
        },
      },
    };
    // in truth we are lacking a backup key and a owner secret key
    // (although owner secret key is only necessary for MK Databox)
    // to have the crypto ready, but we don't use them in this test
    cryptoContext.hasCryptoReady = true;

    // Actions

    const cryptogram = {
      content: 'AiBZJ5npd5gu6mCDXMY8WUviVr7pmqkqjpfOfglshBu9RAAYzjpm8YhrgpxYBzYaL/xPCeYcnhYKoYgN7gJ9uWnq4DXO0yd2HCxrNHyQ2+pkeDAKkIBdULJX9eLukpragnctqiu/aqJn37UyUEY5ETkdSGJ3C+lw+5al7N63Uu2PRjhoe83We2KhFmtwWWxw5tF0SiWhSzUVi4ty5oCEkpFcwleMxFfeg0fEl7qptieDJGdH96WUVZeg3LSYmjAoivRDojtR1fMDP+EUromjUu6kZ6Hy0C/reu71bcmuKuHW2EcJS1GRWIbN+PMRl/9lJWRyOryR388Or/nWljqIPw==',
      datatype: 'unclassified_purchase',
      data_timestamp: '2019-08-30 14:17',
      producer_application_id: 'some UUID',
      input_source: 'Google Takeout',
      data_channel_id: 3,
    };

    const datatypes = [datatype];
    const fromDatetime = '2019-08-30 13:17';
    const toDatetime = '2019-08-30 15:17';

    fetch.mockResolvedValueOnce(buildJsonResponse([cryptogram]));
    const [retrievedDataPoint] = await cryptoContext.getDataPoints(
      datatypes, fromDatetime, toDatetime,
    );

    // Assertions

    expect(retrievedDataPoint).toEqual(dataPoint);
  });

  it('updates the backupkey in two steps when secrets are already loaded', async () => {
    // Setup
    const firstPassword = 'firstPassword';

    const cryptoContext = new OwnerCryptoContext();
    await cryptoContext.createNewOwnerSecrets(firstPassword);

    const firstBackupKey = cryptoContext.backupKey;

    const secondPassword = 'secondPassword';

    // First Action

    // We are using the functions aliases to test aliasing at the same time.
    // We don't actually need to provide "firstPassword" and "ownerId" here
    // because we know crypto secrets are present in the crypto context,
    // but application code does not have this guarantee and should provide it every time
    const {
      backupData: backupFromPreparation,
    } = await cryptoContext.preparePasswordChange(secondPassword, firstPassword, ownerId);

    // First Assertions

    expect(cryptoContext.backupKey).toEqual(firstBackupKey);

    await expect(saltedSymmetricDecrypt(backupFromPreparation, secondPassword))
      .resolves.toBeTruthy();

    // Second Action

    cryptoContext.commitPasswordChange();

    // Second Assertion

    expect(cryptoContext.backupKey).not.toEqual(firstBackupKey);
  });

  it('updates the backupkey in two steps when secrets must be loaded from backup first', async () => {
    // Setup
    const firstPassword = 'firstPassword';
    const secondPassword = 'secondPassword';

    let firstBackupKey;
    let firstBackupData;
    {
      const cryptoContext = new OwnerCryptoContext();
      ({ backupData: firstBackupData } = (
        await cryptoContext.createNewOwnerSecrets(firstPassword)
      ));
      firstBackupKey = cryptoContext.backupKey;
    }

    // new context without secrets and not initialized
    const cryptoContext = new OwnerCryptoContext();

    // First Action

    // We are using the functions aliases to test aliasing at the same time.
    // We don't actually need to provide "firstPassword" and "ownerId" here
    // because we know crypto secrets are present in the crypto context,
    // but application code does not have this guarantee and should provide it every time
    fetch.mockResolvedValueOnce(buildJsonResponse({ data: firstBackupData }));
    const {
      backupData: backupFromPreparation,
    } = await cryptoContext.preparePasswordChange(secondPassword, firstPassword, ownerId);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // First Assertions

    expect(cryptoContext.backupKey).toEqual(firstBackupKey);

    await expect(saltedSymmetricDecrypt(backupFromPreparation, secondPassword))
      .resolves.toBeTruthy();

    // Second Action

    cryptoContext.commitPasswordChange();

    // Second Assertion

    expect(cryptoContext.backupKey).not.toEqual(firstBackupKey);
  });
});

describe('OwnerCryptoContext.hardPasswordChange', () => {
  it('resets the crypto', async () => {
    // Setup
    const cryptoContext = new OwnerCryptoContext();
    cryptoContext.initialize(ownerId);

    // Actions
    const {
      backupData,
      pubkeys: {
        userPubkey,
      },
    } = await cryptoContext.hardPasswordChange(password);

    // Assertions

    const { secretBackup, backupKey } = await decryptSecretsBackup(backupData, password);
    const rebuiltPublicKey = keyPairFromSecretKey(secretBackup.secretKey).publicKey;
    expect(userPubkey).toEqual(rebuiltPublicKey);

    expect(cryptoContext.store.secrets).toEqual(secretBackup);
    expect(cryptoContext.store.publicKey).toEqual(userPubkey);
    expect(cryptoContext.backupKey).toEqual(backupKey);
  });
});
