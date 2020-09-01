import React, { lazy, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import routes from 'routes';
import { ssoUpdate } from '@misakey/auth/store/actions/sso';
import { screenAuthReset, screenAuthSetIdentifier } from 'store/actions/screens/auth';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import pickAll from '@misakey/helpers/pickAll';
import every from '@misakey/helpers/every';
import difference from '@misakey/helpers/difference';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import getNextSearch from '@misakey/helpers/getNextSearch';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import nonePass from '@misakey/helpers/nonePass';
import getLoginInfo from '@misakey/auth/builder/getLoginInfo';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useNotDoneEffect from 'hooks/useNotDoneEffect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Screen from 'components/dumb/Screen';
import Container from '@material-ui/core/Container';

// LAZY
const AuthError = lazy(() => import('components/screens/Auth/Error'));
const Login = lazy(() => import('components/screens/Auth/Login'));
const Consent = lazy(() => import('components/screens/Auth/Consent'));

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

// HOOKS
const useStyles = makeStyles(() => ({
  screen: {
    alignItems: 'center',
    height: 'inherit',
  },
  screenContent: {
    width: '100%',
  },
}));

// COMPONENTS
const Auth = ({
  match,
  isAuthenticated, sso, currentAcr,
  dispatchSsoUpdate, dispatchResetAuth, dispatchSetIdentifier,
}) => {
  const classes = useStyles();
  const searchParams = useLocationSearchParams(objectToCamelCase);
  const { pathname, search } = useLocation();

  const hasNoFlowParams = useMemo(
    () => noFlowParams(searchParams),
    [searchParams],
  );

  const shouldRedirectToErrorScreen = useMemo(
    () => hasErrorRequiredParams(searchParams) && pathname !== routes.auth.error,
    [pathname, searchParams],
  );

  const errorTo = useMemo(
    () => {
      const errorToSearch = getNextSearch(search, new Map([
        ['error_location', pathname],
      ]));
      return {
        pathname: routes.auth.error,
        search: errorToSearch,
      };
    },
    [search, pathname],
  );

  const loginChallenge = useMemo(
    () => sso.loginChallenge || searchParams.loginChallenge,
    [searchParams, sso],
  );

  const hasLoginChallenge = useMemo(
    () => !isNil(loginChallenge),
    [loginChallenge],
  );

  const isSsoClientEmpty = useMemo(
    () => isEmpty(sso.client),
    [sso],
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

  const isAcrChange = useMemo(() => (currentAcr !== sso.acr), [currentAcr, sso.acr]);

  const onLoadLoginInfo = useCallback(
    () => getLoginInfo(loginChallenge),
    [loginChallenge],
  );

  const onSuccess = useCallback(
    (loginInfo) => Promise.resolve(dispatchSsoUpdate({ ...loginInfo, loginChallenge })),
    [loginChallenge, dispatchSsoUpdate],
  );

  const onError = useCallback(
    () => dispatchResetAuth(),
    [dispatchResetAuth],
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

  const state = useMemo(
    () => ({ isLoading: isFetching }),
    [isFetching],
  );

  const objLoginHint = useMemo(
    () => {
      const { loginHint } = sso;
      return (isEmpty(loginHint) ? null : objectToCamelCase(JSON.parse(loginHint)));
    },
    [sso],
  );

  const { identifier: identifierHint } = useSafeDestr(objLoginHint);

  useNotDoneEffect(
    (onDone) => {
      if (!isNil(identifierHint)) {
        dispatchSetIdentifier(identifierHint);
        onDone();
      }
    },
    [identifierHint, dispatchSetIdentifier],
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
    <Screen
      className={classes.screen}
      classes={{ content: classes.screenContent }}
      state={state}
      disableGrow
    >
      <Container maxWidth={false}>
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
            path={routes.auth.error}
            render={(routerProps) => <AuthError {...routerProps} loginChallenge={loginChallenge} />}
          />
          <Route
            path={routes.auth.consent._}
            component={Consent}
          />
          <Route
            path={routes.auth.signIn._}
            render={(routerProps) => <Login {...routerProps} loginChallenge={loginChallenge} />}
          />
        </Switch>
      </Container>
    </Screen>
  );
};

Auth.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // CONNECT
  isAuthenticated: PropTypes.bool,
  currentAcr: PropTypes.number,
  sso: PropTypes.shape(SSO_PROP_TYPES).isRequired,
  dispatchSsoUpdate: PropTypes.func.isRequired,
  dispatchResetAuth: PropTypes.func.isRequired,
  dispatchSetIdentifier: PropTypes.func.isRequired,
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
  dispatchResetAuth: () => dispatch(screenAuthReset()),
  dispatchSetIdentifier: (identifier) => dispatch(screenAuthSetIdentifier(identifier)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
