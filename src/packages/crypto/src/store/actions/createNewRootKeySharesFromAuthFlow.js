import curry from '@misakey/helpers/curry';

import { getSecretStorageFromAuthFlowBuilder } from '@misakey/auth/builder/secretStorage';
import { createRootKeyShareFromAuthFlowBuilder } from '@misakey/auth/builder/rootKeyShares';
import { getBackupFromAuthFlowBuilder } from '@misakey/auth/builder/backup';
import { conflict } from '@misakey/ui/constants/errorTypes';
import { getCode } from '@misakey/helpers/apiError';
import {
  computeCryptoMigration,
} from '@misakey/crypto';
import {
  migrateToSecretStorageFromAuthFlow,
} from '@misakey/crypto/HttpApi';

import { decryptSecretStorageWithPassword } from '@misakey/crypto/secretStorage';

import createNewRootKeyShares from './createNewRootKeyShares';

const curriedCreateRootKeyShareBuilder = curry(createRootKeyShareFromAuthFlowBuilder);

async function getData({ loginChallenge, identityId, accessToken, password }) {
  try {
    const {
      secrets: encryptedSecretStorage,
      accountId,
    } = await getSecretStorageFromAuthFlowBuilder({ loginChallenge, identityId }, accessToken);

    const { rootKey } = await decryptSecretStorageWithPassword(encryptedSecretStorage, password);

    return {
      accountId,
      rootKey,
    };
  } catch (error) {
    if (getCode(error) === conflict) {
      const {
        data: encryptedSecretsBackup,
        accountId,
      } = await getBackupFromAuthFlowBuilder({ loginChallenge, identityId }, accessToken);

      const {
        secretStorage: {
          rootKey,
        },
        migrationPayload,
      } = (
        await computeCryptoMigration({
          encryptedSecretsBackup,
          password,
        })
      );

      await migrateToSecretStorageFromAuthFlow(migrationPayload, { accessToken });

      return {
        accountId,
        rootKey,
      };
    }
    throw error;
  }
}

export default ({
  loginChallenge,
  identityId,
  password,
}, accessToken) => (
  async (dispatch) => {
    const {
      rootKey,
      accountId,
    } = await getData({ loginChallenge, identityId, accessToken, password });

    const createRootKeyShareBuilder = curriedCreateRootKeyShareBuilder(accessToken);

    return dispatch(createNewRootKeyShares({
      rootKey,
      accountId,
      uploadMisakeyShare: createRootKeyShareBuilder,
    }));
  }
);
