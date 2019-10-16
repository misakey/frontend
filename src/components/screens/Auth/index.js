import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import Container from '@material-ui/core/Container';

import pick from '@misakey/helpers/pick';
import every from '@misakey/helpers/every';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import difference from '@misakey/helpers/difference';
import objectToQueryString from '@misakey/helpers/objectToQueryString';
import getSearchParams from '@misakey/helpers/getSearchParams';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import compose from '@misakey/helpers/compose';
import complement from '@misakey/helpers/complement';
import anyPass from '@misakey/helpers/anyPass';

import routes from 'routes';

import { ssoUpdate } from 'store/actions/sso';
import 'components/screens/Auth/Auth.scss';

import { screenAuthReset } from 'store/actions/screens/auth';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import AuthError from './Error';

import SignIn from './SignIn';
import SignUp from './SignUp';

// LAZY
const Forgot = lazy(() => import('./Forgot'));

// CONSTANTS
const SEARCH_PARAMS = ['client_id', 'client_name', 'login_challenge', 'logo_uri'];

// HELPERS
const pickSearchParams = pick(SEARCH_PARAMS);

const LOGIN_REQUIRED_SEARCH_PARAMS = ['client_id', 'client_name', 'login_challenge', 'logo_uri'];
const CONSENT_REQUIRED_SEARCH_PARAMS = ['client_id', 'client_name', 'consent_challenge', 'logo_uri'];
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


// COMPONENT
function Auth({ dispatch, from, isAuthenticated, location, match, sso, userManager }) {
  const searchParams = getSearchParams(location.search);

  function onMount() {
    if (!isEmpty(searchParams)) {
      dispatch(ssoUpdate(objectToCamelCase(pickSearchParams(searchParams))));
    }

    return () => dispatch(screenAuthReset());
  }

  React.useEffect(onMount, []);

  const challenge = searchParams.login_challenge;

  if (shouldRedirectToLoginFlow(searchParams)) {
    if (isAuthenticated) {
      return <Redirect to={from || routes.account._} />;
    }

    const ssoQueryParams = objectToSnakeCase(sso);

    const hasSsoQueryParams = difference(SEARCH_PARAMS, Object.keys(ssoQueryParams)).length === 0;
    if (hasSsoQueryParams && every(ssoQueryParams, (p) => !isNil(p))) {
      const queryParams = objectToQueryString(ssoQueryParams);
      return <Redirect to={`${location.pathname}?${queryParams}`} />;
    }

    userManager.signinRedirect();
  }

  if (hasErrorRequiredParams(searchParams) && location.pathname !== routes.auth.error) {
    const queryParams = objectToQueryString({ ...searchParams, error_location: location.pathname });
    return <Redirect to={`${routes.auth.error}?${queryParams}`} />;
  }

  return (
    <div id="Auth">
      <Container>
        <div className="flex">
          <Switch>
            <Route path={routes.auth.error} component={AuthError} />
            <Route path={routes.auth.signUp._} component={SignUp} />
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
        </div>
      </Container>
    </div>
  );
}

Auth.propTypes = {
  dispatch: PropTypes.func.isRequired,
  from: PropTypes.objectOf(PropTypes.any), // same origin referrer from PrivateRoute
  isAuthenticated: PropTypes.bool,
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  sso: PropTypes.shape({ loginChallenge: PropTypes.string }).isRequired,
  userManager: PropTypes.object.isRequired,
};

Auth.defaultProps = {
  from: null,
  isAuthenticated: false,
};

export default connect(
  (state) => ({
    isAuthenticated: !!state.auth.token,
    sso: state.sso,
  }),
)(withUserManager(Auth));
