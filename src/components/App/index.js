import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { SnackbarProvider } from 'notistack';
import { withTranslation } from 'react-i18next';

import Layout from 'components/smart/Layout';
import SplashScreen from '@misakey/ui/SplashScreen';
import DisclaimerBeta from 'components/dumb/Disclaimer/Beta';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import RouteAccessRequest from 'components/smart/Route/AccessRequest';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallback';

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
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <DisclaimerBeta />
      <Suspense fallback={<SplashScreen />}>
        <Layout>
          <Switch>
            <Route exact path={routes._} component={Landing} />
            <Route exact path={routes.plugin} component={Plugin} />

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
            { /* @FIXME: move with other account route when auth in plugin is implemented */}
            <Route exact path={routes.account.thirdParty.setup} component={ThirdPartySetup} />
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
    </SnackbarProvider>
  );
}

App.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(App);
