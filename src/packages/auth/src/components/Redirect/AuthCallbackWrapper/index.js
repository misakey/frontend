import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import API from '@misakey/api';
import { signIn } from '../../../store/actions/auth';
import AuthCallback from '../AuthCallback';

const useHandleSuccess = (
  onSignIn,
  enqueueSnackbar,
  t,
) => useCallback((user) => {
  const credentials = {
    expiresAt: user.expires_at,
    id: user.id_token,
    token: user.access_token,
  };
  onSignIn(credentials);
  enqueueSnackbar(t('account.signIn.success'), { variant: 'success' });
}, [onSignIn, enqueueSnackbar, t]);

const useHandleError = (enqueueSnackbar, t) => useCallback(({ error, errorCode }) => {
  if (error && error.httpStatus) {
    enqueueSnackbar(
      t(`httpStatus.error.${API.errors.filter(error.httpStatus)}`),
      { variant: 'error' },
    );
  }

  if (errorCode) {
    enqueueSnackbar(
      t('httpStatus.error.default'),
      { variant: 'error' },
    );
  }
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
const mapDispatchToProps = (onSignIn) => ({
  onSignIn: (credentials) => onSignIn(signIn(credentials)),
});

export default connect(null, mapDispatchToProps)(RedirectAuthCallbackWrapper);
