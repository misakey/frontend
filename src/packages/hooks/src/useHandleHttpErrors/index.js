import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import API from '@misakey/api';

// HOOKS
export default () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    (error) => {
      const text = t(`common:httpStatus.error.${API.errors.filter(error.status || 'default')}`);
      enqueueSnackbar(text, { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );
};
