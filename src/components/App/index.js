import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import routes from 'routes';

import useProcessRedirect from '@misakey/auth/hooks/useProcessRedirect';

import ErrorBoundary from 'components/smart/ErrorBoundary';
import { Route, Switch } from 'react-router-dom';
import Redirect from 'components/dumb/Redirect';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallbackWrapper';
import SeclevelWarningAlert from 'components/smart/Alert/SeclevelWarning';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

import './App.scss';

// LAZY
const Auth = lazy(() => import('components/screens/Auth'));
const BoxesApp = lazy(() => import('components/screens/app'));

// CONSTANTS
const REFERRERS = {
  success: routes._,
  error: routes._,
};

const SIGN_IN_REDIRECT_CONFIG = { referrer: routes._ };

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

const App = ({ t, isAuthenticated }) => {
  const processRedirect = useProcessRedirect();


  return (
    <ErrorBoundary maxWidth="md" my={3}>
      <Suspense fallback={<SplashScreenWithTranslation />}>
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
          <Route
            path={routes.auth._}
            component={Auth}
          />
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
              processRedirect(SIGN_IN_REDIRECT_CONFIG);
              return null;
            }}
          />
          {!isAuthenticated && (
          <Route
            render={() => {
              processRedirect();
              return null;
            }}
          />
          )}
          {/* BOXES APP */}
          <Route component={BoxesApp} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
};

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
