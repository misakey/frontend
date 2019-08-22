import React from 'react';
import PropTypes from 'prop-types';
import { SnackbarProvider } from 'notistack';
import { withTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import SplashScreen from 'components/dumb/SplashScreen';
import RoutePrivate from 'components/smart/Route/Private';

import './App.scss';

import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallback';
import Layout from 'components/smart/Layout';

const Home = React.lazy(() => import('components/screen/Home'));
const ServiceCreate = React.lazy(() => import('components/screen/Service/Create'));
const ServiceList = React.lazy(() => import('components/screen/Service/List'));
const Service = React.lazy(() => import('components/screen/Service'));
const NotFound = React.lazy(() => import('components/screen/NotFound'));

const FALLBACK_REFERRERS = {
  success: '/',
  error: '/error',
};

function App({ t }) {
  return (
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <React.Suspense fallback={<SplashScreen />}>
        <Layout>
          <Switch>
            <Route exact path={routes._} component={Home} />
            <Route
              path={routes.auth.callback}
              render={props => (
                <RedirectAuthCallback
                  {...props}
                  fallbackReferrers={FALLBACK_REFERRERS}
                  t={t}
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
