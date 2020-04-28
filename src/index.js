/* global browser */ // eslint-disable-line no-redeclare

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

/* IMPORTS */
import React from 'react';
import ReactDOM from 'react-dom';
// metrics
import * as Sentry from '@sentry/browser';
// store
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider as StoreProvider } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import reducers from 'store/reducers';
// middlewares
import API from '@misakey/api';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import APITokenMiddleware from '@misakey/auth/middlewares/APItoken';
import invalidTokenMiddleware from 'middlewares/invalidToken';
import invalidSeclevelMiddleware from 'middlewares/invalidSeclevel';
import floodManagementAlertMiddleware from 'middlewares/floodManagement/alert';
// routing
import { BrowserRouter as Router } from 'react-router-dom';
import * as serviceWorker from 'serviceWorker';
// ui
import MuiThemeProvider from 'components/smart/ThemeProvider';
import theme from '@misakey/ui/theme';
import 'react-virtualized/styles.css';
// components
import App from 'components/App';

import SplashScreen from '@misakey/ui/Screen/Splash';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import OidcProvider from '@misakey/auth/components/OidcProvider'; // OIDC provider
import { SnackbarProvider } from 'notistack';
// translations
import './i18n';
import countries from 'i18n-iso-countries';
// helpers
import { isDesktopDevice } from '@misakey/helpers/devices';
import { IS_PLUGIN } from 'constants/plugin';
import isNil from '@misakey/helpers/isNil';
import { isSilentAuthIframe, processSilentAuthCallbackInIframe } from '@misakey/auth/helpers'; // Silent auth

import { isSigninRedirect, processSigninRedirect } from '@misakey/helpers/auth';

/* END OF IMPORTS */

if (window.env.ENV !== 'development' || window.env.SENTRY.debug === true) {
  const sentryConfig = window.env.SENTRY;
  if (!isNil(window.bundleVersion)) {
    sentryConfig.release = `frontend@${window.bundleVersion}`;
  }
  if (IS_PLUGIN) {
    sentryConfig.release = `plugin@${browser.runtime.getManifest().version}`;
  }
  Sentry.init(sentryConfig);
}

const rootNode = document.getElementById('root');

if (IS_PLUGIN && isDesktopDevice) {
  rootNode.setAttribute(
    'data-plugin-controlsize',
    true,
  );
}

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'));

// The main purpose of the iframe is to launch auth request and update user
// in localStorage when the request is finished. It doesn't need to load the
// rest of the application and if it does, the iframe can throw timeout errors
// https://github.com/maxmantz/redux-oidc/issues/48#issuecomment-315422236
if (isSilentAuthIframe()) {
  processSilentAuthCallbackInIframe();
} else if (isSigninRedirect()) {
  processSigninRedirect();
} else {
  // STORE
  const storeMiddleWares = [thunk, APITokenMiddleware];
  if (window.env.ENV === 'development') { storeMiddleWares.push(createLogger()); }

  const rootPersistConfig = { key: 'root', storage, whitelist: ['global'], blacklist: [] };
  const persistedReducer = persistReducer(rootPersistConfig, reducers);
  const store = createStore(persistedReducer, compose(applyMiddleware(...storeMiddleWares)));
  const persistor = persistStore(store);

  // ADD MIDDLEWARE TO API
  API.addMiddleware(invalidTokenMiddleware(store.dispatch));
  API.addMiddleware(invalidSeclevelMiddleware(store.dispatch));
  API.addMiddleware(floodManagementAlertMiddleware(100)); // 100ms delay

  // SPLASH SCREEN CONFIG
  const SPLASH_SCREEN_PROPS = { height: '100vh', width: '100vw' };

  ReactDOM.render((
    <React.Suspense fallback={<SplashScreen {...SPLASH_SCREEN_PROPS} />}>
      <StoreProvider store={store}>
        <PersistGate
          loading={(
            <SplashScreenWithTranslation {...SPLASH_SCREEN_PROPS} />)}
          persistor={persistor}
        >
          <MuiThemeProvider theme={theme}>
            <Router>
              <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <OidcProvider
                  store={store}
                  config={window.env.AUTH}
                >
                  <App />
                </OidcProvider>
              </SnackbarProvider>
            </Router>
          </MuiThemeProvider>
        </PersistGate>
      </StoreProvider>
    </React.Suspense>
  ), rootNode);

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: http://bit.ly/CRA-PWA
  serviceWorker.unregister();
}
