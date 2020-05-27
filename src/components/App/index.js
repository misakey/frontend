import React, { lazy, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { WORKSPACE } from 'constants/workspaces';
import { updateProfile } from '@misakey/auth/store/actions/auth';

import isNil from '@misakey/helpers/isNil';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import ErrorBoundary from 'components/smart/ErrorBoundary';
import ScreenSplash from 'components/dumb/Screen/Splash';

import { withTranslation } from 'react-i18next';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Home from 'components/newScreens/Home';
import NotFound from 'components/screens/NotFound';
import Requests from 'components/screens/DPO/Service/Requests/Read';

import Redirect from 'components/dumb/Redirect';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallbackWrapper';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import RouteAccessRequest from 'components/smart/Route/AccessRequest';
import SeclevelWarningAlert from 'components/smart/Alert/SeclevelWarning';

import './App.scss';

// LAZY
const Account = lazy(() => import('components/screens/Account'));
const DPO = lazy(() => import('components/screens/DPO'));
const Citizen = lazy(() => import('components/screens/Citizen'));
const Auth = lazy(() => import('components/screens/Auth'));

// CONSTANTS
const REFERRERS = {
  success: routes._,
  error: routes._,
};

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

const App = ({ isAuthenticated, dispatchUpdateProfileWorkspace, t }) => {
  const workspace = useLocationWorkspace(true);
  // update profile workspace anytime workspace and isAuthenticated change
  useEffect(
    () => {
      if (!isNil(workspace) && workspace !== WORKSPACE.ACCOUNT && isAuthenticated) {
        dispatchUpdateProfileWorkspace(workspace);
      }
    },
    [workspace, dispatchUpdateProfileWorkspace, isAuthenticated],
  );

  return (
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
              <TRedirectAuthCallback fallbackReferrers={REFERRERS} t={t} {...routerProps} />
            )}
          />

          {/* WORKSPACES */}
          <Route path={routes.citizen._} component={Citizen} />
          <Route path={routes.dpo._} component={DPO} />

          <Route path={[routes.boxes._, routes.accounts._]} component={Home} />

          {/* REQUESTS */}
          <RouteAccessRequest exact path={routes.requests} component={Requests} />

          {/* DEFAULT */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
};

App.propTypes = {
  // CONNECT
  isAuthenticated: PropTypes.bool,
  dispatchUpdateProfileWorkspace: PropTypes.func.isRequired,

  t: PropTypes.func.isRequired,
};

App.defaultProps = {
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateProfileWorkspace: (workspace) => dispatch(updateProfile({ workspace })),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('components')(App));
