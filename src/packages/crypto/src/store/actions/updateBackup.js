import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';

import { updateSecretsBackup } from '@misakey/crypto/secretsBackup';
import setStorageBackupVersion from '@misakey/crypto/helpers/setStorageBackupVersion';
import { BadBackupVersion } from '@misakey/crypto/Errors/classes';

import setBackupVersion from './setBackupVersion';

export default () => (
  async (dispatch, getState) => {
    const state = getState();

    // @FIXME declare a "selector" in auth package in charge of retrieving the identity?
    if (isEmpty(path(['auth', 'identity', 'accountId'], state))) {
      // no account => no backup possible
      return;
    }

    const { accountId } = state.auth.identity;
    const { secrets, backupKey, backupVersion } = state.crypto;

    if (!isNil(backupKey)) {
      try {
        const newBackupVersion = backupVersion + 1;
        await updateSecretsBackup(accountId, secrets, backupKey, newBackupVersion);
        const version = await dispatch(setBackupVersion(newBackupVersion));
        setStorageBackupVersion(version);
      } catch (e) {
        if (e.details && (e.details.version === 'invalid')) {
          throw new BadBackupVersion();
        }
        throw e;
      }
    }
  }
);
