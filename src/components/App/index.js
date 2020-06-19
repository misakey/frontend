import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

import ErrorBoundary from 'components/smart/ErrorBoundary';
import ScreenSplash from 'components/dumb/Screen/Splash';

import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Home from 'components/screens/app/Home';
import NotFound from 'components/oldScreens/NotFound';
import Invitation from 'components/screens/app/Invitation';

import Redirect from 'components/dumb/Redirect';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallbackWrapper';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import SeclevelWarningAlert from 'components/smart/Alert/SeclevelWarning';

import { processSigninRedirect } from '@misakey/helpers/auth';

import './App.scss';

// LAZY
const Account = lazy(() => import('components/oldScreens/Account'));
const Auth = lazy(() => import('components/screens/Auth'));

// CONSTANTS
const REFERRERS = {
  success: routes._,
  error: routes._,
};

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

const App = ({ t, isAuthenticated }) => (
  <ErrorBoundary maxWidth="md" my={3}>
    <Suspense fallback={<ScreenSplash />}>
      <SeclevelWarningAlert />
      <Switch>
        {/* LEGALS */}
        <Route
          exact
          path={routes.legals.tos}
          render={(routerProps) => <Redirect to={t('components:footer.links.tos.href')} {...routerProps} />}
        />
        <Route
          exact
          path={routes.legals.privacy}
          render={(routerProps) => <Redirect to={t('components:footer.links.privacy.href')} {...routerProps} />}
        />
        {/* AUTH and ACCOUNT */}
        <Route path={routes.auth._} component={Auth} />
        <RoutePrivate path={routes.account._} component={Account} />
        <Route
          exact
          path={routes.auth.callback}
          render={(routerProps) => (
            <TRedirectAuthCallback fallbackReferrers={REFERRERS} {...routerProps} />
          )}
        />
        {/* REDIRECT TO SIGN IN */}
        <Route
          exact
          path={routes.auth.redirectToSignIn}
          render={() => {
            processSigninRedirect();
            return null;
          }}
        />
        {!isAuthenticated && (
          <Route
            render={() => {
              processSigninRedirect(false);
              return null;
            }}
          />
        )}

        {/* REDIRECT TO BOXES */}
        <Redirect
          exact
          from={routes._}
          to={routes.boxes._}
        />

        {/* OTHERS */}
        <Route path={[routes.boxes._, routes.accounts._]} component={Home} />
        <Route
          path={routes.boxes.invitation}
          component={Invitation}
        />

        {/* DEFAULT */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  </ErrorBoundary>
);

App.propTypes = {
  // CONNECT
  isAuthenticated: PropTypes.bool,

  t: PropTypes.func.isRequired,
};

App.defaultProps = {
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(withTranslation('components')(App));
