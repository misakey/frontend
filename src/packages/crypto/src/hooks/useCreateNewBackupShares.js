

import { createBackupKeyShareBuilder } from '@misakey/auth/builder/backupKeyShares';
import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { setBackupKeyShare } from '../store/actions/concrete';
import { splitBackupKey } from '../secretsBackup/shares';

export default (dispatch) => {
  const { t } = useTranslation('common');
  const { enqueueSnackbar } = useSnackbar();

  const createNewBackupKeyShares = useCallback(
    (backupKey, accountId) => {
      const {
        localBackupKeyShare,
        misakeyBackupKeyShare,
      } = splitBackupKey(backupKey, { accountId });
      return createBackupKeyShareBuilder(misakeyBackupKeyShare)
        .then(() => dispatch(setBackupKeyShare({ backupKeyShare: localBackupKeyShare, accountId })))
        .catch(() => {
          enqueueSnackbar(t('common:crypto.errors.backupKeyShare'), { variant: 'warning' });
        });
    },
    [dispatch, enqueueSnackbar, t],
  );
  return createNewBackupKeyShares;
};

