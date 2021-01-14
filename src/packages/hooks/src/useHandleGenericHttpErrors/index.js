import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import API from '@misakey/api';

import isEmpty from '@misakey/helpers/isEmpty';
import { isInternalError } from '@misakey/helpers/apiError';
import logSentryException from '@misakey/helpers/log/sentry/exception';

// HOOKS
export default () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    (error) => {
      if (isEmpty(error.details) || isInternalError(error)) {
        const text = t([`common:httpStatus.error.${API.errors.filter(error.status)}`, 'common:anErrorOccurred']);
        enqueueSnackbar(text, { variant: 'error' });
        // log sentry exception
        logSentryException(error);
        return true;
      }
      throw error; // if not handled, rethrow error
    },
    [enqueueSnackbar, t],
  );
};
