import loadSecrets from '@misakey/crypto/store/actions/loadSecrets';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import ensureIdentityKey from '@misakey/crypto/store/actions/ensureIdentityKey';

import isNil from '@misakey/helpers/isNil';
import logSentry from '@misakey/helpers/log/sentry';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import useWatchStorageBackupVersion from '@misakey/crypto/hooks/useWatchStorageBackupVersion';
import createNewBackupKeyShares from '@misakey/crypto/store/actions/createNewBackupKeyShares';
import updateBackup from '@misakey/crypto/store/actions/updateBackup';

import { decryptSecretsBackup } from '../secretsBackup/encryption';
import { selectors } from '../store/reducers';
import useFetchSecretBackup from './useFetchSecretBackup';

// CONSTANTS
const {
  accountId: ACCOUNT_ID_SELECTOR,
} = authSelectors;

// HOOKS
export default ((skipUpdate = false) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  const accountId = useSelector(ACCOUNT_ID_SELECTOR);

  const encryptedSecretsBackup = useFetchSecretBackup();
  const boxesSecretKeys = useSelector(selectors.boxesSecretKeys);

  const [, onStorageEvent] = useWatchStorageBackupVersion();

  const onDecryptSuccess = useCallback(async ({ backupKey, secrets, backupVersion }) => {
    // Can occur when a user first log with ACR on a box and then create an account
    const shouldMerge = !boxesSecretKeys.every(
      (key) => secrets.boxDecryptionKeys.includes(key),
    );
    // do not trigger onStorageEvent when we update backup, as it's already done there
    const onStorageEventWhenNoBackupUpdate = shouldMerge ? Promise.resolve : onStorageEvent;

    const keySharePromise = dispatch(createNewBackupKeyShares({ backupKey, accountId }))
      // failure of backup key share creation should not make secret loading fail
      .catch((reason) => {
        logSentry(reason, 'OpenVault: create new backup key share', { crypto: true });
        enqueueSnackbar(t('common:crypto.errors.backupKeyShare'), { variant: 'warning' });
      });

    await Promise.all([
      dispatch(loadSecrets({ secrets, backupKey, backupVersion })),
      keySharePromise,
      onStorageEventWhenNoBackupUpdate(backupVersion),
    ]);

    if (shouldMerge) {
      // XXX maybe it would be more intuitive to use a different action like "mergeSecrets"
      // which would include a call to "updateBackup"
      await dispatch(updateBackup());
    }

    await dispatch(ensureIdentityKey());
  }, [accountId, boxesSecretKeys, dispatch, onStorageEvent, enqueueSnackbar, t]);

  const decryptWithPassword = useCallback(
    (password) => {
      if (isNil(encryptedSecretsBackup)) {
        return Promise.resolve();
      }
      const { data, backupVersion } = encryptedSecretsBackup;

      return decryptSecretsBackup(data, password)
        .then(({ backupKey, secretBackup: secrets }) => (skipUpdate
          ? Promise.resolve
          : onDecryptSuccess(
            { backupKey, secrets, backupVersion },
          )));
    },
    [encryptedSecretsBackup, onDecryptSuccess, skipUpdate],
  );

  return decryptWithPassword;
});
