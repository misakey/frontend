import { getBackupFromAuthFlowBuilder } from '@misakey/auth/builder/backup';
import { createBackupKeyShareFromAuthFlowBuilder } from '@misakey/auth/builder/backupKeyShares';

import { decryptSecretsBackup } from '@misakey/crypto/secretsBackup/encryption';

import createNewBackupKeyShares from './createNewBackupKeyShares';

export default function ({
  loginChallenge,
  identityId,
  password,
}) {
  return async (dispatch) => {
    const {
      data: encryptedSecretBackup,
      accountId,
    } = await getBackupFromAuthFlowBuilder({ loginChallenge, identityId });
    const { backupKey } = await decryptSecretsBackup(encryptedSecretBackup, password);

    dispatch(createNewBackupKeyShares({
      backupKey,
      accountId,
      uploadMisakeyShare: createBackupKeyShareFromAuthFlowBuilder,
    }));
  };
}
