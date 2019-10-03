import React from 'react';
import PropTypes from 'prop-types';
import { SnackbarProvider } from 'notistack';
import { withTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import SplashScreen from '@misakey/ui/SplashScreen';
import RoutePrivate from '@misakey/auth/components/Route/Private';

import './App.scss';

import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallback';
import Layout from 'components/smart/Layout';

// LAZY
const Home = React.lazy(() => import('components/screen/Home'));
const ServiceCreate = React.lazy(() => import('components/screen/Service/Create'));
const ServiceList = React.lazy(() => import('components/screen/Service/List'));
const Service = React.lazy(() => import('components/screen/Service'));
const NotFound = React.lazy(() => import('components/screen/NotFound'));

// CONSTANTS
const REFERRERS = {
  success: routes.service.information._,
  error: routes._,
};


// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

function App({ t }) {
  return (
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <React.Suspense fallback={<SplashScreen />}>
        <Layout>
          <Switch>
            <Route exact path={routes._} component={Home} />
            <Route
              path={routes.auth.callback}
              render={routerProps => (
                <TRedirectAuthCallback
                  fallbackReferrers={REFERRERS}
                  t={t}
                  {...routerProps}
                />
              )}
            />
            <RoutePrivate path={routes.service.create._} component={ServiceCreate} />
            <RoutePrivate path={routes.service.list} component={ServiceList} />
            <Route path={routes.service.home._} component={Service} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </React.Suspense>
    </SnackbarProvider>
  );
}

App.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(App);
