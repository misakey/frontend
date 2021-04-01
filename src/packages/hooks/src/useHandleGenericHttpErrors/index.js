import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import API from '@misakey/core/api';

import isEmpty from '@misakey/core/helpers/isEmpty';
import { isInternalError } from '@misakey/core/helpers/apiError';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import { HandledError } from '@misakey/core/api/API/errors';

// HOOKS
export default () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  return useCallback(
    (error) => {
      if (error instanceof HandledError) {
        logSentryException(error, 'handleGenericHttpErrors', undefined, 'warning');
        return true;
      }
      logSentryException(error, 'handleGenericHttpErrors');
      if (isEmpty(error.details) || isInternalError(error)) {
        const text = t([`common:httpStatus.error.${API.errors.filter(error.status)}`, 'common:anErrorOccurred']);
        enqueueSnackbar(text, { variant: 'error' });
        // log sentry exception
        return true;
      }
      throw error; // if not handled, rethrow error
    },
    [enqueueSnackbar, t],
  );
};
