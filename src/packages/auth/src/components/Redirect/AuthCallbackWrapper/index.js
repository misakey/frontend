import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import API from '@misakey/api';
import { signIn } from '../../../store/actions/auth';
import AuthCallback from '../AuthCallback';

const useHandleSuccess = (
  onSignIn,
  enqueueSnackbar,
  t,
) => useCallback((user) => {
  const { idToken, accessToken, expiresAt } = objectToCamelCase(user);
  const credentials = { expiresAt, id: idToken, token: accessToken };
  onSignIn(credentials);
  enqueueSnackbar(t('account.signIn.success'), { variant: 'success' });
}, [onSignIn, enqueueSnackbar, t]);

const useHandleError = (enqueueSnackbar, t) => useCallback(({ error, errorCode }) => {
  // Errors from API
  if (error && error.httpStatus) {
    enqueueSnackbar(
      t(`httpStatus.error.${API.errors.filter(error.httpStatus)}`),
      { variant: 'error' },
    );
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
}, [enqueueSnackbar, t]);

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
