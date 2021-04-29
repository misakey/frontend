import React, { useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';
import authRoutes from '@misakey/react/auth/routes';

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
  displayHints,
  identity,
  isFetchingLoginInfo,
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

  const userPublicData = useMemo(
    () => (isNil(identity) ? {} : { ...pick(['displayName', 'avatarUrl'], identity), identifier }),
    [identifier, identity],
  );

  const isLoading = useMemo(
    () => isSubmitting || isFetchingLoginInfo,
    [isFetchingLoginInfo, isSubmitting],
  );

  useNotDoneEffect(
    (onDone) => {
      if (!isFetchingLoginInfo) {
        if (identifierValid) {
          setIsSubmitting(true);
          onSubmit(identifier)
            .catch(handleHttpErrors)
            .finally(() => setIsSubmitting(false));
        }
        onDone();
      }
    },
    [onSubmit, identifier, identifierValid, handleHttpErrors],
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
              isLoading={isLoading}
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
              isLoading={isLoading}
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
  isFetchingLoginInfo: PropTypes.bool,
  // CONNECT
  identifier: PropTypes.string,
  displayHints: SSO_PROP_TYPES.displayHints,
  client: SSO_PROP_TYPES.client.isRequired,
  identity: SSO_PROP_TYPES.identity,
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

AuthLogin.defaultProps = {
  identity: null,
  isFetchingLoginInfo: false,
  identifier: '',
  displayHints: {},
};

// CONNECT
const mapStateToProps = (state) => ({
  identifier: state.sso.identifier,
  displayHints: state.sso.displayHints,
  identity: state.sso.identity,
  client: state.sso.client,
});

export default connect(mapStateToProps, {})(AuthLogin);
