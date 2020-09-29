import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { parseAcr } from '@misakey/helpers/parseAcr';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import { signIn } from '../../../store/actions/auth';
import AuthCallback from '../AuthCallback';

const useHandleSuccess = (
  onSignIn,
  enqueueSnackbar,
  t,
) => useCallback((user) => {
  const { idToken, accessToken, expiresAt, profile } = objectToCamelCase(user);
  const { acr } = profile;
  const credentials = {
    expiresAt,
    id: idToken,
    token: accessToken,
    acr: parseAcr(acr),
  };
  onSignIn(credentials);
  enqueueSnackbar(t('common:signedIn'), { variant: 'success' });
}, [onSignIn, enqueueSnackbar, t]);

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

    // Ohers errors (front))
    enqueueSnackbar(
      t('common:anErrorOccurred'),
      { variant: 'error' },
    );
  }, [enqueueSnackbar, t, handleGenericHttpErrors]);
};

// COMPONENTS
const RedirectAuthCallbackWrapper = ({ onSignIn, t, ...rest }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleSuccess = useHandleSuccess(onSignIn, enqueueSnackbar, t);
  const handleError = useHandleError(enqueueSnackbar, t);

  return <AuthCallback handleSuccess={handleSuccess} handleError={handleError} {...rest} />;
};

RedirectAuthCallbackWrapper.propTypes = {
  onSignIn: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  onSignIn: (credentials) => dispatch(signIn(credentials)),
});

export default connect(null, mapDispatchToProps)(RedirectAuthCallbackWrapper);
