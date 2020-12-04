import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import isObject from '@misakey/helpers/isObject';
import { StorageUnavailable } from '@misakey/helpers/storage';
import mapOidcUserForStore from '@misakey/auth/helpers/mapOidcUserForStore';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import { signIn } from '../../../store/actions/auth';
import AuthCallback from '../AuthCallback';

const useHandleSuccess = (
  dispatch,
  enqueueSnackbar,
  t,
) => useCallback((user) => {
  dispatch(signIn(mapOidcUserForStore(user)));
  enqueueSnackbar(t('common:signedIn'), { variant: 'success' });
}, [enqueueSnackbar, t, dispatch]);

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
const RedirectAuthCallbackWrapper = ({ t, ...rest }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const handleSuccess = useHandleSuccess(dispatch, enqueueSnackbar, t);
  const handleError = useHandleError(enqueueSnackbar, t);

  return <AuthCallback handleSuccess={handleSuccess} handleError={handleError} {...rest} />;
};

RedirectAuthCallbackWrapper.propTypes = {
  t: PropTypes.func.isRequired,
};

export default RedirectAuthCallbackWrapper;
