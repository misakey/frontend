import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { useSnackbar } from 'notistack';
import { Redirect } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import routes from 'routes';
import { SIGN_IN_STATE_LENGTH } from 'constants/auth';

import { signIn } from 'store/actions/auth';

import SplashScreen from 'components/dumb/SplashScreen';

function AuthSignInCallback({ dispatch, location, t }) {
  const { enqueueSnackbar } = useSnackbar();

  const [callbackParams] = React.useState(
    queryString.parse((location.hash.indexOf('#') === 0
      ? location.hash.replace('#', '?')
      : location.hash
    )),
  );

  const base64referer = callbackParams.state.substr(SIGN_IN_STATE_LENGTH);
  const referrer = base64referer ? atob(base64referer) : null;

  function handleSuccess() {
    const credentials = {
      expiryAt: callbackParams.expiry,
      id: callbackParams.id_token,
      token: callbackParams.access_token,
    };

    dispatch(signIn(credentials));

    const text = t('account.signIn.success');
    enqueueSnackbar(text, { variant: 'success' });
  }

  function handleError(e) {
    const text = t(`error:${API.errors.filter(e.httpStatus)}`);
    enqueueSnackbar(text, { variant: 'error' });
  }

  if (callbackParams.error) {
    handleError(callbackParams.error);
    return <Redirect to={referrer || routes.landing} />;
  }

  if (callbackParams.access_token) {
    handleSuccess();
    return <Redirect to={referrer || routes.application._} />;
  }

  return <SplashScreen text={t('signingIn', 'Signing in...')} translated />;
}

AuthSignInCallback.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.shape({ hash: PropTypes.string, search: PropTypes.string }).isRequired,
  t: PropTypes.func.isRequired,
};

export default connect()(withTranslation()(AuthSignInCallback));
