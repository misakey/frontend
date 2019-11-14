import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { SnackbarProvider } from 'notistack';
import { withTranslation } from 'react-i18next';

import Layout from 'components/smart/Layout';
import SplashScreen from 'components/dumb/SplashScreen';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import RouteAccessRequest from 'components/smart/Route/AccessRequest';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallback';

import ErrorBoundary from 'components/smart/ErrorBoundary';
import Auth from 'components/screens/Auth';
import Landing from 'components/screens/Landing';
import Citizen from 'components/screens/Citizen';
import NotFound from 'components/screens/NotFound';
import Requests from 'components/screens/DPO/Service/Requests/Read';
import Plugin from 'components/screens/Plugin';
import ThirdPartySetup from 'components/screens/Citizen/Application/Info/ThirdParty/Setup';

import './App.scss';

// LAZY
const Account = lazy(() => import('components/screens/Account'));
const Admin = lazy(() => import('components/screens/Admin'));
const DPO = lazy(() => import('components/screens/DPO'));

// CONSTANTS
const REFERRERS = {
  success: routes._,
  error: routes._,
};

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

function App({ t }) {
  return (
    <ErrorBoundary component={Container} maxWidth="md" my={3}>
      <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>

        {window.env.PLUGIN && (
        <Layout>
          <Switch>
            <Route exact path={routes.plugin} component={Plugin} />
            <Route path={routes.citizen._} component={Citizen} />
            { /* @FIXME: move with other account routes when save profile will be implemented */}
            <Route
              exact
              path={routes.account.thirdParty.setup}
              render={(routerProps) => <ThirdPartySetup {...routerProps} />}
            />
            {/* DEFAULT */}
            <Route component={NotFound} />
          </Switch>
        </Layout>
        )}


        {!window.env.PLUGIN && (
        <Suspense fallback={<SplashScreen />}>
          <Layout>
            <Switch>
              <Route exact path={routes._} component={Landing} />
              {window.env.PLUGIN && <Route exact path={routes.plugin} component={Plugin} />}

              {/* LEGALS */}
              <Route
                exact
                path={routes.legals.tos}
                component={() => window.location.replace(t('footer.links.tos.href'))}
              />
              <Route
                exact
                path={routes.legals.privacy}
                component={() => window.location.replace(t('footer.links.privacy.href'))}
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
              <Route path={routes.admin._} component={Admin} />
              <Route path={routes.citizen._} component={Citizen} />
              <Route path={routes.dpo._} component={DPO} />

              {/* REQUESTS */}
              <RouteAccessRequest
                exact
                path={routes.requests._}
                component={Requests}
                componentProps={{ showGoBack: false }}
              />

              {/* DEFAULT */}
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Suspense>
        )}

      </SnackbarProvider>
    </ErrorBoundary>
  );
}

App.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(App);
