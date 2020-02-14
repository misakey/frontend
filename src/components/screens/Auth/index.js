import React, { lazy, useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import API from '@misakey/api';

import { makeStyles } from '@material-ui/core/styles';

import isNil from '@misakey/helpers/isNil';
import pickAll from '@misakey/helpers/pickAll';
import every from '@misakey/helpers/every';
import head from '@misakey/helpers/head';
import difference from '@misakey/helpers/difference';
import objectToQueryString from '@misakey/helpers/objectToQueryString';
import getSearchParams from '@misakey/helpers/getSearchParams';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import compose from '@misakey/helpers/compose';
import complement from '@misakey/helpers/complement';
import anyPass from '@misakey/helpers/anyPass';
import isArray from '@misakey/helpers/isArray';

import routes from 'routes';

import { ssoUpdate } from 'store/actions/sso';
import Screen from 'components/dumb/Screen';

import { screenAuthReset, screenAuthSetIdentifier } from 'store/actions/screens/auth';

import { withUserManager } from '@misakey/auth/components/OidcProvider';

// LAZY
const AuthError = lazy(() => import('./Error'));
const SignIn = lazy(() => import('./SignIn'));
const SignUp = lazy(() => import('./SignUp'));
const Forgot = lazy(() => import('./Forgot'));

// CONSTANTS
const SEARCH_PARAMS = ['login_challenge'];

const LOGIN_REQUIRED_SEARCH_PARAMS = ['login_challenge'];
const CONSENT_REQUIRED_SEARCH_PARAMS = ['consent_challenge'];
const ERROR_SEARCH_PARAMS = ['error_code', 'error_description'];

const hasRequiredSearchParams = (requiredSearchParamsList) => (searchParams) => (
  difference(requiredSearchParamsList, Object.keys(searchParams)).length === 0
);

const hasLoginRequiredParams = hasRequiredSearchParams(LOGIN_REQUIRED_SEARCH_PARAMS);
const hasConsentRequiredParams = hasRequiredSearchParams(CONSENT_REQUIRED_SEARCH_PARAMS);
const hasErrorRequiredParams = hasRequiredSearchParams(ERROR_SEARCH_PARAMS);

const nonePass = compose(complement, anyPass);
const shouldRedirectToLoginFlow = nonePass(
  [hasLoginRequiredParams, hasConsentRequiredParams, hasErrorRequiredParams],
);

// CONSTANTS
const APPLICATION_ENDPOINT = {
  method: 'GET',
  path: '/application-info/:id',
};

const LOGIN_INFO_ENDPOINT = {
  method: 'GET',
  path: '/login/info',
};

const fetchApplication = (id) => API
  .use(APPLICATION_ENDPOINT)
  .build({ id })
  .send();

const fetchLoginInfo = (challenge) => API
  .use(LOGIN_INFO_ENDPOINT)
  .build(null, null, { login_challenge: challenge })
  .send();

// HOOKS

const useStyles = makeStyles(() => ({
  screen: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));


const useGetLoginInfos = (challenge, dispatch, setIsFetching, setError) => useCallback(() => {
  setIsFetching(true);
  fetchLoginInfo(challenge)
    .then((response) => {
      const { clientId, acrValues, loginHint } = objectToCamelCase(response);
      return fetchApplication(clientId)
        .then((application) => {
          const { id, name, logoUri } = objectToCamelCase(application);
          dispatch(ssoUpdate({
            clientId: id,
            clientName: name,
            logoUri,
            loginChallenge: challenge,
            acr: isArray(acrValues) ? parseInt(head(acrValues), 10) : null,
          }));
          dispatch(screenAuthSetIdentifier(loginHint));
        });
    })
    .catch((e) => { setError(e); })
    .finally(() => { setIsFetching(false); });
}, [challenge, dispatch, setError, setIsFetching]);

// COMPONENT
function Auth({ dispatch, from, isAuthenticated, currentAcr, location, match, sso, userManager }) {
  const classes = useStyles();

  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const searchParams = getSearchParams(location.search);
  const shouldRedirectToLogin = useMemo(
    () => shouldRedirectToLoginFlow(searchParams), [searchParams],
  );
  const shouldRedirectToErrorScreen = useMemo(
    () => hasErrorRequiredParams(searchParams) && location.pathname !== routes.auth.error,
    [location.pathname, searchParams],
  );
  const challenge = useMemo(
    () => sso.loginChallenge || objectToCamelCase(searchParams).loginChallenge,
    [searchParams, sso.loginChallenge],
  );
  const { hasRequiredSsoQueryParams, requiredSsoQueryParams } = useMemo(() => {
    const ssoQueryParams = objectToSnakeCase(sso);

    const requiredParams = pickAll(SEARCH_PARAMS, ssoQueryParams);
    const hasRequiredParams = every(requiredParams, (element) => !isNil(element));

    return {
      hasRequiredSsoQueryParams: hasRequiredParams,
      requiredSsoQueryParams: objectToQueryString(requiredParams),
    };
  }, [sso]);

  const getLoginInfos = useGetLoginInfos(challenge, dispatch, setIsFetching, setError);

  const state = useMemo(() => ({ isLoading: isFetching, error }), [error, isFetching]);
  const isAcrChange = useMemo(() => (currentAcr !== sso.acr), [currentAcr, sso.acr]);

  useEffect(() => {
    getLoginInfos();

    return () => dispatch(screenAuthReset());
  }, [dispatch, getLoginInfos]);

  if (shouldRedirectToLogin) {
    if (isAuthenticated && !isAcrChange) {
      return <Redirect to={from} />;
    }

    if (hasRequiredSsoQueryParams) {
      return <Redirect to={`${location.pathname}?${requiredSsoQueryParams}`} />;
    }

    userManager.signinRedirect();
  }

  if (shouldRedirectToErrorScreen) {
    const queryParams = objectToQueryString({ ...searchParams, error_location: location.pathname });
    return <Redirect to={`${routes.auth.error}?${queryParams}`} />;
  }

  return (
    <Screen
      hideAppBar
      state={state}
      className={classes.screen}
      disableGrow
    >
      <Switch>
        <Route exact path={routes.auth.error} component={AuthError} />
        <Route
          path={routes.auth.signUp._}
          render={(routerProps) => <SignUp {...routerProps} />}
        />
        <Route
          path={routes.auth.signIn}
          render={(routerProps) => <SignIn {...routerProps} challenge={challenge} />}
        />
        <Route
          path={routes.auth.forgotPassword}
          component={Forgot}
        />
        <Redirect from={match.path} to={routes.auth.signIn} exact />
      </Switch>
    </Screen>
  );
}

Auth.propTypes = {
  dispatch: PropTypes.func.isRequired,
  from: PropTypes.objectOf(PropTypes.any), // same origin referrer from PrivateRoute
  isAuthenticated: PropTypes.bool,
  currentAcr: PropTypes.number,
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  sso: PropTypes.shape({
    loginChallenge: PropTypes.string,
    clientId: PropTypes.string,
    acr: PropTypes.number,
  }).isRequired,
  userManager: PropTypes.object.isRequired,
};

Auth.defaultProps = {
  from: null,
  isAuthenticated: false,
  currentAcr: null,
};

export default connect(
  (state) => ({
    isAuthenticated: !!state.auth.token,
    currentAcr: state.auth.acr,
    sso: state.sso,
  }),
)(withUserManager(Auth));
