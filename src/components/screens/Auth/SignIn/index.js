import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import { DEFAULT_SECLEVEL, STEP } from 'constants/auth';
import { isAuthSeclevelInsufficient, handleAuthSeclevelInsufficient } from 'constants/Errors/classes/AuthSeclevelInsufficient';
import AuthStepAlreadyExistsConflict, { handleAuthStepAlreadyExistsConflict } from 'constants/Errors/classes/AuthStepAlreadyExistsConflict';
import { isAuthNotConfirmedConflict, handleAuthNotConfirmedConflict } from 'constants/Errors/classes/AuthNotConfirmedConflict';

import { screenAuthSetCredentials } from 'store/actions/screens/auth';

import log from '@misakey/helpers/log';

import isEmpty from '@misakey/helpers/isEmpty';

import fetchInitAuth from '@misakey/auth/builder/initAuth';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useSnackbar } from 'notistack';

import { Route, Switch, Redirect, useHistory, useLocation } from 'react-router-dom';
import SignInIdentifier from 'components/screens/Auth/SignIn/Identifier';
import SignInSecret from 'components/screens/Auth/SignIn/Secret';

// HELPERS
const handleSecretPrepareCodeConflict = handleAuthStepAlreadyExistsConflict(STEP.secret);
const handleIdentifierNotConfirmedConflict = handleAuthNotConfirmedConflict(STEP.identifier);
const handleIdentifierSeclevelInsufficient = handleAuthSeclevelInsufficient(STEP.identifier);

// COMPONENTS
function AuthSignIn({ challenge, identifier, publicInfo, acr, dispatchSetCredentials, match, t }) {
  const { replace, push } = useHistory();
  const { search } = useLocation();

  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const serverRelief = useMemo(
    () => Boolean(publicInfo) && Boolean(publicInfo.argon2Params),
    [publicInfo],
  );

  const onInitAuth = useCallback(
    async () => {
      try {
        return fetchInitAuth({
          challenge,
          email: identifier,
          acr: (acr || DEFAULT_SECLEVEL),
          serverRelief,
        });
      } catch (e) {
        handleIdentifierNotConfirmedConflict(e);
        handleIdentifierSeclevelInsufficient(e);
        handleSecretPrepareCodeConflict(e);
        // throw error as is if handlers did not throw already
        throw e;
      }
    },
    [challenge, identifier, acr, serverRelief],
  );

  const onInitAuthSuccess = useCallback(
    () => {
      push({ pathname: routes.auth.signIn.secret, search });
    },
    [push, search],
  );

  const onInitAuthError = useCallback(
    (error) => {
      if (isAuthNotConfirmedConflict(error)) {
        dispatchSetCredentials(identifier, null);
        replace({ pathname: routes.auth.signUp.confirm, search });
      } else if (error instanceof AuthStepAlreadyExistsConflict) {
        enqueueSnackbar(t('auth:login.form.error.conflict'), { variant: 'error' });
        push({ pathname: routes.auth.signIn.secret, search });
      } else if (!isAuthSeclevelInsufficient(error)) {
        // handle only other errors because previous one is already handled
        handleHttpErrors(error);
      }
      log(error, 'error');
    },
    [
      dispatchSetCredentials,
      enqueueSnackbar,
      handleHttpErrors,
      identifier,
      push,
      replace,
      search,
      t,
    ],
  );

  const shouldFetch = useMemo(
    () => !isEmpty(identifier),
    [identifier],
  );

  const { isFetching, error } = useFetchEffect(
    onInitAuth,
    { shouldFetch, stopOnError: false },
    { onSuccess: onInitAuthSuccess, onError: onInitAuthError },
  );

  const identifierError = useMemo(
    () => (!isFetching && isAuthSeclevelInsufficient(error) ? error : undefined),
    [isFetching, error],
  );

  return (
    <Switch>
      {isEmpty(identifier)
            && <Redirect exact from={routes.auth.signIn.secret} to={routes.auth.signIn._} />}
      <Route
        exact
        path={routes.auth.signIn.secret}
        render={(routerProps) => (
          <SignInSecret
            {...routerProps}
            challenge={challenge}
            identifier={identifier}
            acr={acr}
          />
        )}
      />
      <Route
        path={match.path}
        render={(routerProps) => (
          <SignInIdentifier
            {...routerProps}
            challenge={challenge}
            identifier={identifier}
            acr={acr}
            error={identifierError}
          />
        )}
      />
    </Switch>
  );
}

AuthSignIn.propTypes = {
  challenge: PropTypes.string.isRequired,
  // CONNECT
  identifier: PropTypes.string,
  acr: PropTypes.number,
  publicInfo: PropTypes.object,
  dispatchSetCredentials: PropTypes.func.isRequired,
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AuthSignIn.defaultProps = {
  acr: null,
  identifier: '',
  publicInfo: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  identifier: state.screens.auth.identifier,
  publicInfo: state.screens.auth.publics,
  acr: state.sso.acr,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetCredentials: (identifier, secret) => dispatch(
    screenAuthSetCredentials(identifier, secret),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('auth')(AuthSignIn));
