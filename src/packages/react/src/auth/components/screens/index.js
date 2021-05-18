import React, { lazy, useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { connect, batch } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import authRoutes from '@misakey/react/auth/routes';
import { ssoUpdate, onSetIdentifier, ssoReset } from '@misakey/react/auth/store/actions/sso';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';

import retry from '@misakey/core/helpers/retry';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import pickAll from '@misakey/core/helpers/pickAll';
import every from '@misakey/core/helpers/every';
import difference from '@misakey/core/helpers/difference';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import getNextSearch from '@misakey/core/helpers/getNextSearch';
import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import nonePass from '@misakey/core/helpers/nonePass';
import getLoginInfo from '@misakey/core/auth/builder/getLoginInfo';
import { stringify as scopeStringify } from '@misakey/core/helpers/scope';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ScreenLoader from '@misakey/ui/Screen/Loader';
import AuthCallbackHintsContextProvider from '../Context/AuthCallbackHints';

// LAZY
const AuthError = lazy(() => retry(() => import('@misakey/react/auth/components/screens/Error')));
const Login = lazy(() => retry(() => import('@misakey/react/auth/components/screens/Login')));
const Consent = lazy(() => retry(() => import('@misakey/react/auth/components/screens/Consent')));

// CONSTANTS
const LOGIN_REQUIRED_SEARCH_PARAMS = ['loginChallenge'];
const CONSENT_REQUIRED_SEARCH_PARAMS = ['consentChallenge'];
const ERROR_SEARCH_PARAMS = ['error', 'errorDescription'];

const SSO_REQUIRED_SEARCH_PARAMS = LOGIN_REQUIRED_SEARCH_PARAMS;

// HELPERS
const hasRequiredSearchParams = (requiredSearchParamsList) => (searchParams) => (
  difference(requiredSearchParamsList, Object.keys(searchParams)).length === 0
);

const hasLoginRequiredParams = hasRequiredSearchParams(LOGIN_REQUIRED_SEARCH_PARAMS);
const hasConsentRequiredParams = hasRequiredSearchParams(CONSENT_REQUIRED_SEARCH_PARAMS);
const hasErrorRequiredParams = hasRequiredSearchParams(ERROR_SEARCH_PARAMS);

const noFlowParams = nonePass(
  [hasLoginRequiredParams, hasConsentRequiredParams, hasErrorRequiredParams],
);

// COMPONENTS
const Auth = ({
  match,
  isAuthenticated, sso, currentAcr,
  dispatchSsoUpdate, dispatchSetIdentifier, dispatchSsoReset,
}) => {
  const searchParams = useLocationSearchParams(objectToCamelCase);
  const { pathname, search } = useLocation();

  const hasNoFlowParams = useMemo(
    () => noFlowParams(searchParams),
    [searchParams],
  );

  const shouldRedirectToErrorScreen = useMemo(
    () => hasErrorRequiredParams(searchParams) && pathname !== authRoutes.error,
    [pathname, searchParams],
  );

  const errorTo = useMemo(
    () => {
      const errorToSearch = getNextSearch(search, new Map([
        ['error_location', pathname],
      ]));
      return {
        pathname: authRoutes.error,
        search: errorToSearch,
      };
    },
    [search, pathname],
  );

  const { loginChallenge: ssoLoginChallenge, client, acr } = useSafeDestr(sso);

  const loginChallenge = useMemo(
    () => ssoLoginChallenge || searchParams.loginChallenge,
    [searchParams, ssoLoginChallenge],
  );

  const hasLoginChallenge = useMemo(
    () => !isNil(loginChallenge),
    [loginChallenge],
  );

  const isSsoClientEmpty = useMemo(
    () => isEmpty(client),
    [client],
  );

  // Do not fetch when handling consent flow
  const shouldFetch = useMemo(
    () => hasLoginChallenge && (!hasConsentRequiredParams(searchParams) || isSsoClientEmpty),
    [searchParams, hasLoginChallenge, isSsoClientEmpty],
  );

  const requiredSsoParams = useMemo(
    () => pickAll(SSO_REQUIRED_SEARCH_PARAMS, sso),
    [sso],
  );

  const hasRequiredSsoParams = useMemo(
    () => every(requiredSsoParams, (ssoParam) => !isNil(ssoParam)),
    [requiredSsoParams],
  );

  const requiredSsoTo = useMemo(
    () => ({
      pathname,
      search: getNextSearch(
        search,
        new Map(Object.entries(objectToSnakeCase(requiredSsoParams))),
      ),
    }),
    [pathname, search, requiredSsoParams],
  );

  const isAcrChange = useMemo(() => (currentAcr !== acr), [currentAcr, acr]);

  const onLoadLoginInfo = useCallback(
    () => getLoginInfo(loginChallenge),
    [loginChallenge],
  );

  const onSuccess = useCallback(
    ({ scope: scopeArray, loginHint, displayHints: stringifiedHints, ...loginInfo }) => {
      const displayHints = isEmpty(stringifiedHints) ? undefined : JSON.parse(stringifiedHints);
      batch(() => {
        if (!isNil(loginHint)) {
          dispatchSetIdentifier(loginHint);
        }
        dispatchSsoUpdate({
          ...loginInfo,
          scope: scopeStringify(scopeArray),
          loginHint,
          displayHints,
          loginChallenge,
        });
      });
    },
    [dispatchSsoUpdate, loginChallenge, dispatchSetIdentifier],
  );

  const onError = useCallback(
    () => dispatchSsoReset(),
    [dispatchSsoReset],
  );

  const { isFetching, error } = useFetchEffect(
    onLoadLoginInfo,
    { shouldFetch },
    { onSuccess, onError },
  );

  const hasLoginInfoError = useMemo(
    () => !isNil(error),
    [error],
  );

  if (hasNoFlowParams) {
    if (isAuthenticated && !isAcrChange) {
      return <Redirect to={errorTo} />;
    }
    if (hasRequiredSsoParams) {
      return <Redirect to={requiredSsoTo} />;
    }
  }

  if (shouldRedirectToErrorScreen) {
    return <Redirect to={errorTo} />;
  }

  return (
    <AuthCallbackHintsContextProvider>
      <ScreenLoader isLoading={isFetching} />
      <Switch>
        {(hasLoginInfoError || hasNoFlowParams) && (
          <Route
            path={match.path}
            render={(routerProps) => (
              <AuthError {...routerProps} loginChallenge={loginChallenge} error={error} />
            )}
          />
        )}
        <Route
          exact
          path={authRoutes.error}
          render={(routerProps) => <AuthError {...routerProps} loginChallenge={loginChallenge} />}
        />
        <Route
          path={authRoutes.consent._}
          component={Consent}
        />
        <Route
          path={authRoutes.signIn._}
          render={(routerProps) => (
            <Login
              {...routerProps}
              isFetchingLoginInfo={isFetching}
              loginChallenge={loginChallenge}
            />
          )}
        />
      </Switch>
    </AuthCallbackHintsContextProvider>
  );
};

Auth.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // CONNECT
  isAuthenticated: PropTypes.bool,
  currentAcr: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sso: PropTypes.shape(SSO_PROP_TYPES).isRequired,
  dispatchSsoUpdate: PropTypes.func.isRequired,
  dispatchSetIdentifier: PropTypes.func.isRequired,
  dispatchSsoReset: PropTypes.func.isRequired,
};

Auth.defaultProps = {
  isAuthenticated: false,
  currentAcr: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  currentAcr: state.auth.acr,
  sso: state.sso,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSsoUpdate: (sso) => dispatch(ssoUpdate(sso)),
  dispatchSsoReset: () => dispatch(ssoReset()),
  dispatchSetIdentifier: (identifier) => dispatch(onSetIdentifier(identifier)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
