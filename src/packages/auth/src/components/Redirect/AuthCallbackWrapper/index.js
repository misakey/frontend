import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { parseAcr } from '@misakey/helpers/parseAcr';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import { signIn } from '../../../store/actions/auth';
import AuthCallback from '../AuthCallback';

const useHandleSuccess = (
  dispatch,
  enqueueSnackbar,
  t,
) => useCallback((user) => {
  const { idToken, csrfToken, expiresAt, profile } = objectToCamelCase(user);
  const { acr } = profile;
  const credentials = {
    expiresAt,
    id: idToken,
    token: csrfToken,
    isAuthenticated: !isNil(csrfToken),
    acr: parseAcr(acr),
  };
  dispatch(signIn(credentials));
  enqueueSnackbar(t('common:signedIn'), { variant: 'success' });
}, [enqueueSnackbar, t, dispatch]);

const useHandleError = (enqueueSnackbar, t) => {
  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  return useCallback(({ error, errorCode }) => {
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

    // Others errors (front))
    enqueueSnackbar(
      t('common:anErrorOccurred'),
      { variant: 'error' },
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
