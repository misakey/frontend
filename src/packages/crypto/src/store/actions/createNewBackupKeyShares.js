import { createBackupKeyShareBuilder } from '@misakey/auth/builder/backupKeyShares';
import { splitBackupKey } from '@misakey/crypto/secretsBackup/keySplitting';

import setBackupKeyShare from './setBackupKeyShare';

/**
 * **Note:** for creating the backup key share during the auth flow,
 * there is a dedicated function `createNewBackupKeySharesFromAuthFlow`
 */
export default function ({
  backupKey,
  accountId,
  uploadMisakeyShare = createBackupKeyShareBuilder,
}) {
  return async (dispatch) => {
    const {
      localBackupKeyShare: localShare,
      misakeyBackupKeyShare: misakeyShare,
    } = splitBackupKey(backupKey, { accountId });

    await uploadMisakeyShare(misakeyShare);

    return dispatch(setBackupKeyShare({
      backupKeyShare: localShare,
      accountId,
    }));
  };
}
