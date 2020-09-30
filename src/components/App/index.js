import React, { lazy, Suspense } from 'react';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import ErrorBoundary from 'components/smart/ErrorBoundary';
import { Route, Switch } from 'react-router-dom';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallbackWrapper';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import RedirectToSignIn from 'components/dumb/Redirect/ToSignIn';

import './App.scss';

// LAZY
const Auth = lazy(() => import('components/screens/Auth'));
const BoxesApp = lazy(() => import('components/screens/app'));

// CONSTANTS
const REFERRERS = {
  success: routes._,
  error: routes._,
};

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

const App = () => (
  <ErrorBoundary maxWidth="md" my={3}>
    <Suspense fallback={<SplashScreenWithTranslation />}>
      <Switch>
        {/* AUTH */}
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
          component={RedirectToSignIn}
        />
        {/* BOXES APP */}
        <Route component={BoxesApp} />
      </Switch>
    </Suspense>
  </ErrorBoundary>
);

export default App;
