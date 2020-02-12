import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

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
    acr: !isNil(acr) && !isEmpty(acr) ? parseInt(acr, 10) : null,
  };
  onSignIn(credentials);
  enqueueSnackbar(t('account.signIn.success'), { variant: 'success' });
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
        t('httpStatus.error.default'),
        { variant: 'error' },
      );
      return;
    }

    // Ohers errors (front))
    enqueueSnackbar(
      t('httpStatus.error.default'),
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
