import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import { getBackupFromAuthFlowBuilder } from '@misakey/auth/builder/backup';
import { decryptSecretsBackup } from '@misakey/crypto/secretsBackup/encryption';
import useCreateNewBackupShares from '@misakey/crypto/hooks/useCreateNewBackupShares';

export default (loginChallenge, identityId) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const { enqueueSnackbar } = useSnackbar();
  const createNewBackupKeyShares = useCreateNewBackupShares(dispatch, /* fromAuthFlow = */ true);

  return useCallback(async (password) => {
    try {
      const {
        data,
        accountId,
      } = await getBackupFromAuthFlowBuilder({ loginChallenge, identityId });
      const { backupKey } = await decryptSecretsBackup(data, password);
      return createNewBackupKeyShares(backupKey, accountId);
    } catch (err) {
      enqueueSnackbar(t('common:crypto.errors.backupKeyShare'), { variant: 'warning' });
      return Promise.resolve();
    }
  }, [createNewBackupKeyShares, enqueueSnackbar, identityId, loginChallenge, t]);
};

