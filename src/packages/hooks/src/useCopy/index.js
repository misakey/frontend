import copy from '@misakey/helpers/clipboard/copy';

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default (value, { format = 'text/plain', message } = {}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    async () => {
      const success = await copy(value, { format, message });
      if (success) {
        enqueueSnackbar(t('common:copied'), { variant: 'success' });
      }
    },
    [enqueueSnackbar, format, message, t, value],
  );
};
