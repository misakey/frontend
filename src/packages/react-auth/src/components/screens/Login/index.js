import React, { useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react-auth/store/reducers/sso';
import authRoutes from '@misakey/react-auth/routes';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useMountEffect from '@misakey/hooks/useMountEffect';
import useOnIdentifierSubmit from '@misakey/react-auth/hooks/useOnIdentifierSubmit';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

import { Route, Switch, Redirect } from 'react-router-dom';
import LoginIdentifier from '@misakey/react-auth/components/screens/Login/Identifier';
import LoginSecret from '@misakey/react-auth/components/screens/Login/Secret';
import ScreenLoader from '@misakey/ui/Screen/Loader';

// COMPONENTS
const AuthLogin = ({
  identifier, match, client: clientProvider, loginChallenge, loginHint, t, ...props
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleHttpErrors = useHandleHttpErrors();
  const onSubmit = useOnIdentifierSubmit(loginChallenge);

  const { identifier: identifierHint, client: clientHint } = useSafeDestr(loginHint);

  const client = useMemo(
    () => (!isNil(clientHint) ? clientHint : clientProvider),
    [clientHint, clientProvider],
  );

  const identifierValid = useMemo(
    () => !isEmpty(identifier),
    [identifier],
  );

  const identifierHintValid = useMemo(
    () => !isEmpty(identifierHint) && (identifierHint === identifier || isNil(identifier)),
    [identifierHint, identifier],
  );

  useMountEffect(
    () => {
      if (identifierHintValid || identifierValid) {
        setIsSubmitting(true);
        onSubmit(identifierHintValid ? identifierHint : identifier)
          .catch(handleHttpErrors)
          .finally(() => setIsSubmitting(false));
      }
    },
    [onSubmit, identifierHint, identifier, identifierHintValid, identifierValid, handleHttpErrors],
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
              {...loginHint} // should not override identifier
              {...routerProps}
              client={client}
              loginChallenge={loginChallenge}
              identifier={identifier}
              {...props}
            />
          )}
        />
        <Route
          path={match.path}
          render={(routerProps) => (
            <LoginIdentifier
              {...loginHint} // should not override identifier
              {...routerProps}
              client={client}
              identifier={identifier}
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
  client: SSO_PROP_TYPES.client.isRequired,
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AuthLogin.defaultProps = {
  identifier: '',
  loginHint: {},
};

// CONNECT
const mapStateToProps = (state) => ({
  identifier: state.sso.identifier || authSelectors.identifierValue(state),
  loginHint: state.sso.loginHint,
  client: state.sso.client,
});

export default connect(mapStateToProps, {})(withTranslation('auth')(AuthLogin));
