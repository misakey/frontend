import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';

import API from '@misakey/api';

// HOOKS
export default () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    (error) => {
      if (!isNil(error.status)) {
        const text = t(`common:httpStatus.error.${API.errors.filter(error.status || 'default')}`);
        enqueueSnackbar(text, { variant: 'error' });
      } else {
        throw error;
      }
    },
    [enqueueSnackbar, t],
  );
};
