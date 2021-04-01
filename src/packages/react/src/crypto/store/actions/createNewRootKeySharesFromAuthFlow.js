import { getSecretStorageFromAuthFlowBuilder } from '@misakey/core/auth/builder/secretStorage';
import { createRootKeyShareFromAuthFlowBuilder } from '@misakey/core/auth/builder/rootKeyShares';
import { getBackupFromAuthFlowBuilder } from '@misakey/core/auth/builder/backup';
import { conflict } from '@misakey/core/api/constants/errorTypes';
import { getCode } from '@misakey/core/helpers/apiError';
import {
  computeCryptoMigration,
} from '@misakey/core/crypto';
import {
  migrateToSecretStorageFromAuthFlow,
} from '@misakey/core/crypto/HttpApi';

import { decryptSecretStorageWithPassword } from '@misakey/core/crypto/secretStorage';

import createNewRootKeyShares from './createNewRootKeyShares';

async function getData({ loginChallenge, identityId, password }) {
  try {
    const {
      secrets: encryptedSecretStorage,
      accountId,
    } = await getSecretStorageFromAuthFlowBuilder({ loginChallenge, identityId });

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
      } = await getBackupFromAuthFlowBuilder({ loginChallenge, identityId });

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

      await migrateToSecretStorageFromAuthFlow(migrationPayload);

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
}) => (
  async (dispatch) => {
    const {
      rootKey,
      accountId,
    } = await getData({ loginChallenge, identityId, password });

    return dispatch(createNewRootKeyShares({
      rootKey,
      accountId,
      uploadMisakeyShare: createRootKeyShareFromAuthFlowBuilder,
    }));
  }
);
