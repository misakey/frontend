import React, { useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';
import authRoutes from '@misakey/react/auth/routes';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import pick from '@misakey/core/helpers/pick';
import useNotDoneEffect from '@misakey/hooks/useNotDoneEffect';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useOnIdentifierSubmit from '@misakey/react/auth/hooks/useOnIdentifierSubmit';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

import { Route, Switch, Redirect } from 'react-router-dom';
import LoginIdentifier from '@misakey/react/auth/components/screens/Login/Identifier';
import LoginSecret from '@misakey/react/auth/components/screens/Login/Secret';
import ScreenLoader from '@misakey/ui/Screen/Loader';

// COMPONENTS
const AuthLogin = ({
  identifier,
  match,
  client: clientProvider,
  loginChallenge,
  loginHint,
  displayHints,
  identity,
  ...props
}) => {
  const { t } = useTranslation('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleHttpErrors = useHandleHttpErrors();
  const onSubmit = useOnIdentifierSubmit(loginChallenge);

  const { client: clientHint } = useSafeDestr(displayHints);

  const client = useMemo(
    () => (!isNil(clientHint) ? clientHint : clientProvider),
    [clientHint, clientProvider],
  );

  const identifierValid = useMemo(
    () => !isEmpty(identifier),
    [identifier],
  );

  const identifierHintValid = useMemo(
    () => !isEmpty(loginHint) && (loginHint === identifier || isNil(identifier)),
    [loginHint, identifier],
  );

  const userPublicData = useMemo(
    () => (isNil(identity) ? {} : { ...pick(['displayName', 'avatarUrl'], identity), identifier }),
    [identifier, identity],
  );

  useNotDoneEffect(
    (onDone) => {
      // if auth flow is launched with Misakey,
      // there is always a loginHint that contains the state at the end
      if (!isEmpty(loginHint)) {
        if (identifierHintValid || identifierValid) {
          setIsSubmitting(true);
          onSubmit(identifierHintValid ? loginHint : identifier)
            .catch(handleHttpErrors)
            .finally(() => setIsSubmitting(false));
        }
        onDone();
      }
    },
    [onSubmit, loginHint, identifier, identifierHintValid, identifierValid, handleHttpErrors],
  );

  useUpdateDocHead(t('auth:login.documentTitle'));

  return (
    <>
      <ScreenLoader isLoading={isSubmitting} />
      <Switch>
        {isEmpty(identifier)
          && <Redirect exact from={authRoutes.signIn.secret} to={authRoutes.signIn._} />}
        <Route
          exact
          path={authRoutes.signIn.secret}
          render={(routerProps) => (
            <LoginSecret
              {...displayHints}
              {...routerProps}
              client={client}
              loginChallenge={loginChallenge}
              identifier={identifier}
              identity={identity}
              userPublicData={userPublicData}
              {...props}
            />
          )}
        />
        <Route
          path={match.path}
          render={(routerProps) => (
            <LoginIdentifier
              {...displayHints}
              {...routerProps}
              client={client}
              identifier={identifier}
              identity={identity}
              userPublicData={userPublicData}
              loginChallenge={loginChallenge}
              isLoading={isSubmitting}
              {...props}
            />
          )}
        />
      </Switch>
    </>
  );
};

AuthLogin.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  // CONNECT
  identifier: PropTypes.string,
  loginHint: SSO_PROP_TYPES.loginHint,
  displayHints: SSO_PROP_TYPES.displayHints,
  client: SSO_PROP_TYPES.client.isRequired,
  identity: SSO_PROP_TYPES.identity,
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

AuthLogin.defaultProps = {
  identity: null,
  identifier: '',
  loginHint: null,
  displayHints: {},
};

// CONNECT
const mapStateToProps = (state) => ({
  identifier: state.sso.identifier || authSelectors.identifierValue(state),
  loginHint: state.sso.loginHint,
  displayHints: state.sso.displayHints,
  identity: state.sso.identity,
  client: state.sso.client,
});

export default connect(mapStateToProps, {})(AuthLogin);
