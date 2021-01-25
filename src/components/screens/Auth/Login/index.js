import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';
import routes from 'routes';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useMountEffect from '@misakey/hooks/useMountEffect';
import useOnIdentifierSubmit from 'hooks/useOnIdentifierSubmit';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

import { Route, Switch, Redirect } from 'react-router-dom';
import LoginIdentifier from 'components/screens/Auth/Login/Identifier';
import LoginSecret from 'components/screens/Auth/Login/Secret';

// COMPONENTS
const AuthLogin = ({ identifier, match, loginChallenge, loginHint, t, ...props }) => {
  const handleHttpErrors = useHandleHttpErrors();
  const onSubmit = useOnIdentifierSubmit(loginChallenge);

  const objLoginHint = useMemo(
    () => (isEmpty(loginHint) ? {} : objectToCamelCase(JSON.parse(loginHint))),
    [loginHint],
  );

  const { identifier: identifierHint } = useSafeDestr(objLoginHint);

  useMountEffect(
    () => {
      if (!isEmpty(identifierHint) && identifierHint === identifier) {
        onSubmit(identifierHint)
          .catch(handleHttpErrors);
      }
    },
    [onSubmit, identifierHint, identifier, handleHttpErrors],
  );

  useUpdateDocHead(t('auth:login.documentTitle'));

  return (
    <Switch>
      {isEmpty(identifier)
      && <Redirect exact from={routes.auth.signIn.secret} to={routes.auth.signIn._} />}
      <Route
        exact
        path={routes.auth.signIn.secret}
        render={(routerProps) => (
          <LoginSecret
            {...objLoginHint} // should not override identifier
            {...routerProps}
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
            {...objLoginHint} // should not override identifier
            {...routerProps}
            identifier={identifier}
            loginChallenge={loginChallenge}
            {...props}
          />
        )}
      />
    </Switch>
  );
};

AuthLogin.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  // CONNECT
  identifier: PropTypes.string,
  loginHint: SSO_PROP_TYPES.loginHint.isRequired,
  client: SSO_PROP_TYPES.client.isRequired,
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AuthLogin.defaultProps = {
  identifier: '',
};

// CONNECT
const mapStateToProps = (state) => ({
  identifier: state.screens.auth.identifier || authSelectors.identifierValue(state),
  loginHint: state.sso.loginHint,
  client: state.sso.client,
});

export default connect(mapStateToProps, {})(withTranslation('auth')(AuthLogin));
