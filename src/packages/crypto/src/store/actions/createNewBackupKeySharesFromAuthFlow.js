import { getBackupFromAuthFlowBuilder } from '@misakey/auth/builder/backup';
import { createBackupKeyShareFromAuthFlowBuilder } from '@misakey/auth/builder/backupKeyShares';

import { decryptSecretsBackup } from '@misakey/crypto/secretsBackup/encryption';
import curry from '@misakey/helpers/curry';

import createNewBackupKeyShares from './createNewBackupKeyShares';

const curriedCreateBackupKeyShareBuilder = curry(createBackupKeyShareFromAuthFlowBuilder);

export default function ({
  loginChallenge,
  identityId,
  password,
}, accessToken) {
  return async (dispatch) => {
    const {
      data: encryptedSecretBackup,
      accountId,
    } = await getBackupFromAuthFlowBuilder({ loginChallenge, identityId }, accessToken);
    const { backupKey } = await decryptSecretsBackup(encryptedSecretBackup, password);
    const createBackupKeyShareBuilder = curriedCreateBackupKeyShareBuilder(accessToken);

    dispatch(createNewBackupKeyShares({
      backupKey,
      accountId,
      uploadMisakeyShare: createBackupKeyShareBuilder,
    }));
  };
}
