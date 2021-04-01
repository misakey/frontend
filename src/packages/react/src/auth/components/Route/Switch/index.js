import React, { lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import authRoutes from '@misakey/react/auth/routes';

import retry from '@misakey/core/helpers/retry';

import RedirectToSignIn from '@misakey/react/auth/components/Redirect/ToSignIn';

// LAZY
const Auth = lazy(() => retry(() => import('@misakey/react/auth/components/screens')));
const RedirectAuthCallback = lazy(() => retry(() => import('@misakey/react/auth/components/Redirect/AuthCallbackWrapper')));

// COMPONENTS
const AuthRoutesSwitch = ({ children, redirectProps }) => (
  <Switch>
    {/* AUTH */}
    <Route
      path={authRoutes._}
      component={Auth}
    />
    <Route
      exact
      path={authRoutes.callback}
      render={(routerProps) => (
        <RedirectAuthCallback
          {...redirectProps}
          {...routerProps}
        />
      )}
    />
    {/* REDIRECT TO SIGN IN */}
    <Route
      exact
      path={authRoutes.redirectToSignIn}
      component={RedirectToSignIn}
    />
    {children}
  </Switch>
);


AuthRoutesSwitch.propTypes = {
  redirectProps: PropTypes.object,
  children: PropTypes.node,
};

AuthRoutesSwitch.defaultProps = {
  children: null,
  redirectProps: {},
};

export default AuthRoutesSwitch;
