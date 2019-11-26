/* global browser */ // eslint-disable-line no-redeclare

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
// routing
import { BrowserRouter as Router } from 'react-router-dom';
import * as serviceWorker from 'serviceWorker';
// ui
import MuiThemeProvider from 'components/smart/ThemeProvider';
import theme from 'theme';
import 'react-virtualized/styles.css';
// components
import App from 'components/App';
import SplashScreen from 'components/dumb/SplashScreen';
import OidcProvider from '@misakey/auth/components/OidcProvider'; // OIDC provider
// translations
import i18n from 'i18n';
import countries from 'i18n-iso-countries';
import FRCommon from 'constants/locales/fr/common';
import FRFields from 'constants/locales/fr/fields';
// helpers
import { isDesktopDevice } from 'helpers/devices';
import isNil from '@misakey/helpers/isNil';
import { isSilentAuthIframe, processSilentAuthCallbackInIframe } from '@misakey/auth/helpers'; // Silent auth

/* END OF IMPORTS */

if (window.env.ENV !== 'development' || window.env.SENTRY.debug === true) {
  const sentryConfig = window.env.SENTRY;
  if (!isNil(window.bundleVersion)) {
    sentryConfig.release = `frontend@${window.bundleVersion}`;
  }
  if (window.env.PLUGIN) {
    sentryConfig.release = `plugin@${browser.runtime.getManifest().version}`;
  }
  Sentry.init(sentryConfig);
}

if (window.env.PLUGIN) {
  document.documentElement.setAttribute(
    'data-plugin-controlsize',
    isDesktopDevice(),
  );
}

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'));

// The main purpose of the iframe is to launch auth request and update user
// in localStorage when the request is finished. It doesn't need to load the
// rest of the application and if it does, the iframe can throw timeout errors
// https://github.com/maxmantz/redux-oidc/issues/48#issuecomment-315422236
if (isSilentAuthIframe()) {
  processSilentAuthCallbackInIframe();
} else {
  i18n.addResourceBundle('fr', 'common', FRCommon, true, true);
  i18n.addResourceBundle('fr', 'fields', FRFields, true, true);
  // If you want a helper to know what you should use as Trans component value in translate file
  // Uncomment next line
  // i18n.init({debug: true});

  // STORE
  const storeMiddleWares = [thunk, APITokenMiddleware];
  if (window.env.ENV === 'development') { storeMiddleWares.push(createLogger()); }

  const rootPersistConfig = { key: 'root', storage, whitelist: ['global'], blacklist: [] };
  const persistedReducer = persistReducer(rootPersistConfig, reducers);
  const store = createStore(persistedReducer, compose(applyMiddleware(...storeMiddleWares)));
  const persistor = persistStore(store);

  // ADD MIDDLEWARE TO API
  API.addMiddleware(invalidTokenMiddleware(store.dispatch));
  ReactDOM.render((
    <React.Suspense fallback={null}>
      <StoreProvider store={store}>
        <OidcProvider store={store} config={window.env.AUTH}>
          <PersistGate loading={<SplashScreen />} persistor={persistor}>
            <MuiThemeProvider theme={theme}>
              <Router>
                <App />
              </Router>
            </MuiThemeProvider>
          </PersistGate>
        </OidcProvider>
      </StoreProvider>
    </React.Suspense>
  ), document.getElementById('root'));

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: http://bit.ly/CRA-PWA
  serviceWorker.unregister();
}
