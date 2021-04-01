import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSnackbar } from 'notistack';
import isObject from '@misakey/core/helpers/isObject';
import { StorageUnavailable } from '@misakey/core/helpers/storage';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import AuthCallback from '../AuthCallback';

const useHandleSuccess = (enqueueSnackbar, t) => useCallback(() => {
  enqueueSnackbar(t('common:signedIn'), { variant: 'success' });
}, [enqueueSnackbar, t]);

const useHandleError = (enqueueSnackbar, t) => {
  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  return useCallback((err) => {
    if (err instanceof StorageUnavailable) {
      enqueueSnackbar(
        t('common:error.storage'),
        { variant: 'warning' },
      );
      return;
    }

    if (isObject(err)) {
      const { error, errorCode } = err;
      // Errors from API
      if (error && error.httpStatus) {
        handleGenericHttpErrors(error);
        return;
      }

      // Errors from hydra
      if (errorCode) {
        enqueueSnackbar(
          t('common:anErrorOccurred'),
          { variant: 'error' },
        );
        return;
      }
    }

    // Others errors (front))
    enqueueSnackbar(
      t('common:anErrorOccurred'),
      { variant: 'warning' },
    );
  }, [enqueueSnackbar, t, handleGenericHttpErrors]);
};

// COMPONENTS
const RedirectAuthCallbackWrapper = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  const handleSuccess = useHandleSuccess(enqueueSnackbar, t);
  const handleError = useHandleError(enqueueSnackbar, t);

  return <AuthCallback handleSuccess={handleSuccess} handleError={handleError} {...props} />;
};

export default RedirectAuthCallbackWrapper;
