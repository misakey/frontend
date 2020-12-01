import copy from '@misakey/helpers/clipboard/copy';

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default (value, format = 'text/plain') => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    () => {
      copy(value, { format });
      const text = t('common:copied');
      enqueueSnackbar(text, { variant: 'success' });
    },
    [enqueueSnackbar, format, t, value],
  );
};
