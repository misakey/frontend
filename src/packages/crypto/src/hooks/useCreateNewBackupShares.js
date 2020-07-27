

import { createBackupKeyShareBuilder, createBackupKeyShareFromAuthFlowBuilder } from '@misakey/auth/builder/backupKeyShares';
import log from '@misakey/helpers/log';
import { useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { setBackupKeyShare } from '../store/actions/concrete';
import { splitBackupKey } from '../secretsBackup/keySplitting';

export default (dispatch, fromAuthFlow = false) => {
  const { t } = useTranslation('common');
  const { enqueueSnackbar } = useSnackbar();

  const createBackupKeyShares = useMemo(
    () => (fromAuthFlow ? createBackupKeyShareFromAuthFlowBuilder : createBackupKeyShareBuilder),
    [fromAuthFlow],
  );

  return useCallback(
    async (backupKey, accountId) => {
      try {
        const {
          localBackupKeyShare,
          misakeyBackupKeyShare,
        } = splitBackupKey(backupKey, { accountId });
        await createBackupKeyShares(misakeyBackupKeyShare);
        return Promise.resolve(
          dispatch(setBackupKeyShare({ backupKeyShare: localBackupKeyShare, accountId })),
        );
      } catch (e) {
        log(e, 'error');
        enqueueSnackbar(t('common:crypto.errors.backupKeyShare'), { variant: 'warning' });
        return Promise.resolve();
      }
    },
    [createBackupKeyShares, dispatch, enqueueSnackbar, t],
  );
};

