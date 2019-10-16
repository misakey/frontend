import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { SnackbarProvider } from 'notistack';
import { withTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';

import RoutePrivate from '@misakey/auth/components/Route/Private';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallback';

import Layout from 'components/smart/Layout';
import RouteAccessRequest from 'components/smart/Route/AccessRequest';
import ServiceRequestsRead from 'components/screens/Service/Requests/Read';

import Auth from 'components/screens/Auth';
import SplashScreen from '@misakey/ui/SplashScreen';
import Landing from 'components/screens/Landing';
import Application from 'components/screens/Application';
import ThirdPartySetup from 'components/screens/Application/Info/ThirdParty/Setup';
import DisclaimerBeta from 'components/dumb/Disclaimer/Beta';

import './App.scss';

// LAZY
const Home = lazy(() => import('components/screens/Home'));
const ServiceCreate = lazy(() => import('components/screens/Service/Create'));
const ServiceList = lazy(() => import('components/screens/Service/List'));
const Service = lazy(() => import('components/screens/Service'));
const Account = lazy(() => import('components/screens/Account'));
const Contact = lazy(() => import('components/screens/Contact'));
const NotFound = lazy(() => import('components/screens/NotFound'));

// CONSTANTS
const REFERRERS = {
  success: routes._,
  error: routes._,
};

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

function App({ t }) {
  return (
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <DisclaimerBeta />
      <Suspense fallback={<SplashScreen />}>
        <Layout>
          <Switch>
            <Route
              path={routes.legals.tos}
              component={() => window.location.replace(t('footer.links.tos.href'))}
            />
            <Route
              path={routes.legals.privacy}
              component={() => window.location.replace(t('footer.links.privacy.href'))}
            />

            <Route path={routes.auth._} component={Auth} />
            <Route exact path={routes.landing} component={Landing} />
            <Route exact path={routes._} component={Home} />
            <Route
              path={routes.auth.callback}
              render={(routerProps) => (
                <TRedirectAuthCallback
                  fallbackReferrers={REFERRERS}
                  t={t}
                  {...routerProps}
                />
              )}
            />

            <RouteAccessRequest
              path={routes.requests._}
              component={ServiceRequestsRead}
              componentProps={{ showGoBack: false }}
            />

            { /* @FIXME: move with other account route when auth in plugin is implemented */}
            <Route path={routes.account.thirdParty.setup} component={ThirdPartySetup} />
            <RoutePrivate path={routes.account._} component={Account} />
            <RoutePrivate path={routes.contact._} component={Contact} />

            {/* ADMIN */}
            <RoutePrivate path={routes.service.create._} component={ServiceCreate} />
            <RoutePrivate path={routes.service.list} component={ServiceList} />
            <Route path={routes.service.home._} component={Service} />

            {/* PAGES_ROSES (APPLICATION) */}
            <Route path={routes.application._} component={Application} />

            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Suspense>
    </SnackbarProvider>
  );
}

App.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(App);
