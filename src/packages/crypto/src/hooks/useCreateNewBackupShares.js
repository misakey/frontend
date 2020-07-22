

import { createBackupKeyShareBuilder } from '@misakey/auth/builder/backupKeyShares';
import log from '@misakey/helpers/log';
import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { setBackupKeyShare } from '../store/actions/concrete';
import { splitBackupKey } from '../secretsBackup/keySplitting';

export default (dispatch) => {
  const { t } = useTranslation('common');
  const { enqueueSnackbar } = useSnackbar();

  const createNewBackupKeyShares = useCallback(
    async (backupKey, accountId) => {
      try {
        const {
          localBackupKeyShare,
          misakeyBackupKeyShare,
        } = splitBackupKey(backupKey, { accountId });
        await createBackupKeyShareBuilder(misakeyBackupKeyShare);
        await dispatch(setBackupKeyShare({ backupKeyShare: localBackupKeyShare, accountId }));
      } catch (e) {
        log(e, 'error');
        enqueueSnackbar(t('common:crypto.errors.backupKeyShare'), { variant: 'warning' });
      }
    },
    [dispatch, enqueueSnackbar, t],
  );
  return createNewBackupKeyShares;
};

