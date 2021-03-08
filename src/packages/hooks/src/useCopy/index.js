import copy from '@misakey/helpers/clipboard/copy';
import isNil from '@misakey/helpers/isNil';

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default (value, { format = 'text/plain', message } = {}, { successText } = {}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    async () => {
      const success = await copy(value, { format, message });
      if (success) {
        enqueueSnackbar(isNil(successText) ? t('common:copied') : successText, { variant: 'success' });
      }
    },
    [enqueueSnackbar, format, message, successText, t, value],
  );
};
