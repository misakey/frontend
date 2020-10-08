import { loadSecrets, loadSecretsAndUpdateBackup } from '@misakey/crypto/store/actions/concrete';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import useBackupStorageEvent from '@misakey/crypto/hooks/useBackupStorageEvent';
import createNewBackupKeyShares from '@misakey/crypto/store/actions/createNewBackupKeyShares';

import { decryptSecretsBackup } from '../secretsBackup/encryption';
import { selectors } from '../store/reducers';
import useFetchSecretBackup from './useFetchSecretBackup';


// HOOKS
export default ((skipUpdate = false) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const encryptedSecretsBackup = useFetchSecretBackup();
  const currentBoxSecrets = useSelector(selectors.currentBoxSecrets);

  const [, onStorageEvent] = useBackupStorageEvent();

  const onDecryptSuccess = useCallback(({ backupKey, secrets, backupVersion }) => {
    // Can occur when a user first log with ACR on a box and then create an account
    const shouldMerge = !currentBoxSecrets.every(
      (key) => secrets.boxDecryptionKeys.includes(key),
    );
    const loadSecretsAction = shouldMerge ? loadSecretsAndUpdateBackup : loadSecrets;
    // do not trigger onStorageEvent when we update backup, as it's already done there
    const onStorageEventWhenNoBackupUpdate = shouldMerge ? Promise.resolve : onStorageEvent;

    const keySharePromise = dispatch(createNewBackupKeyShares({ backupKey, accountId }))
      // failure of backup key share creation should not make secret loading fail
      .catch((reason) => {
        log(reason, 'error');
        enqueueSnackbar(t('common:crypto.errors.backupKeyShare'), { variant: 'warning' });
      });

    return Promise.all([
      dispatch(loadSecretsAction({ secrets, backupKey, backupVersion })),
      keySharePromise,
      onStorageEventWhenNoBackupUpdate(backupVersion),
    ]);
  }, [accountId, currentBoxSecrets, dispatch, onStorageEvent, enqueueSnackbar, t]);

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
