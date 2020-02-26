import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import routes from 'routes';
import { DEFAULT_SECLEVEL, SECLEVEL_CONFIG, STEP } from 'constants/auth';
import { isAuthSeclevelInsufficient, handleAuthSeclevelInsufficient } from 'constants/Errors/classes/AuthSeclevelInsufficient';
import { isAuthPrepareCodeConflict, handleAuthPrepareCodeConflict } from 'constants/Errors/classes/AuthPrepareCodeConflict';
import { isAuthNotConfirmedConflict, handleAuthNotConfirmedConflict } from 'constants/Errors/classes/AuthNotConfirmedConflict';

import { screenAuthSetCredentials } from 'store/actions/screens/auth';

import isEmpty from '@misakey/helpers/isEmpty';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';
import usePropChanged from '@misakey/hooks/usePropChanged';
import { useSnackbar } from 'notistack';

import { Route, Switch, Redirect, useHistory, useLocation } from 'react-router-dom';
import SignInIdentifier from 'components/screens/Auth/SignIn/Identifier';
import SignInSecret from 'components/screens/Auth/SignIn/Secret';

// CONSTANTS
const INIT_AUTH_ENDPOINT = {
  method: 'POST',
  path: '/login/method',
};

// HELPERS
const handleSecretPrepareCodeConflict = handleAuthPrepareCodeConflict(STEP.secret);
const handleIdentifierNotConfirmedConflict = handleAuthNotConfirmedConflict(STEP.identifier);
const handleIdentifierSeclevelInsufficient = handleAuthSeclevelInsufficient(STEP.identifier);

const fetchInitAuth = (challenge, identifier, secret) => API
  .use(INIT_AUTH_ENDPOINT)
  .build(null, {
    challenge,
    identifier,
    secret,
  })
  .send();

// COMPONENTS
function AuthSignIn({ challenge, identifier, acr, dispatchSetCredentials, match, t }) {
  const { replace, push } = useHistory();
  const { search } = useLocation();

  const { enqueueSnackbar } = useSnackbar();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const identifierPropChanged = usePropChanged(identifier);

  const secLevelConfig = useMemo(() => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL], [acr]);

  const authIdentifier = useMemo(
    () => ({
      kind: secLevelConfig.api.identifier.kind,
      value: identifier,
    }),
    [identifier, secLevelConfig.api.identifier.kind],
  );

  const authSecret = useMemo(
    () => ({
      kind: secLevelConfig.api.secret.kind,
    }),
    [secLevelConfig.api.secret.kind],
  );

  const onInitAuth = useCallback(
    () => fetchInitAuth(challenge, authIdentifier, authSecret)
      .catch((e) => {
        handleIdentifierNotConfirmedConflict(e);
        handleIdentifierSeclevelInsufficient(e);
        handleSecretPrepareCodeConflict(e);
        // throw error as is if handlers did not throw already
        throw e;
      }),
    [challenge, authIdentifier, authSecret],
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
      } else if (isAuthPrepareCodeConflict(error)) {
        enqueueSnackbar(t('auth__new:signIn.form.error.conflict'), { variant: 'error' });
        push({ pathname: routes.auth.signIn.secret, search });
      } else if (!isAuthSeclevelInsufficient(error)) {
        // handle only other errors because previous one is already handled
        handleGenericHttpErrors(error);
      }
    },
    [
      dispatchSetCredentials,
      enqueueSnackbar,
      handleGenericHttpErrors,
      identifier,
      push,
      replace,
      search,
      t,
    ],
  );

  const shouldFetch = useMemo(
    () => !isEmpty(identifier) && identifierPropChanged,
    [identifier, identifierPropChanged],
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
  dispatchSetCredentials: PropTypes.func.isRequired,
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AuthSignIn.defaultProps = {
  acr: null,
  identifier: '',
};

// CONNECT
const mapStateToProps = (state) => ({
  identifier: state.screens.auth.identifier,
  acr: state.sso.acr,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetCredentials: (identifier, secret) => dispatch(
    screenAuthSetCredentials(identifier, secret),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('auth__new')(AuthSignIn));
