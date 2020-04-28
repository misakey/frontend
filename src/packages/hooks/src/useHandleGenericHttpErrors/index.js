import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import API from '@misakey/api';

import isEmpty from '@misakey/helpers/isEmpty';
import { isInternalError } from '@misakey/helpers/apiError';

// HOOKS
export default () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    (error) => {
      if (isEmpty(error.details) || isInternalError(error)) {
        const text = t(`common:httpStatus.error.${API.errors.filter(error.status || 'default')}`);
        enqueueSnackbar(text, { variant: 'error' });
        return true;
      }
      throw error; // if not handled, rethrow error
    },
    [enqueueSnackbar, t],
  );
};
