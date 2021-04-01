import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'proxy-polyfill';

import React, { Suspense } from 'react';

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
import API from '@misakey/core/api';
import routes from 'routes';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import floodManagementAlertMiddleware from 'middlewares/floodManagement/alert';
// routing
import RouterWithCustomConfirm from 'components/smart/Router/WithCustomConfirm';
import * as serviceWorker from 'serviceWorker';
// ui
import ThemeProvider from 'components/smart//ThemeProvider';
import ThemeProviderNoStore from 'components/smart//ThemeProvider/NoStore';
// components
import App from 'components/App';

import SplashScreen from '@misakey/ui/Screen/Splash';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import OidcProvider from '@misakey/react-auth/components/OidcProvider'; // OIDC provider
import SnackbarProvider from 'components/smart/SnackbarProvider';
import OfflineContextProvider from 'components/smart/Context/Offline';
import ScreenError from 'components/smart/Screen/Error';
import ErrorBoundary from '@misakey/ui/ErrorBoundary';
import Screen from '@misakey/ui/Screen';

// translations
import configureI18n from '@misakey/ui/i18n';

// helpers
import isNil from '@misakey/core/helpers/isNil';
import oidcSilentRenewalWrapper from '@misakey/core/auth/helpers/oidcSilentRenewalWrapper'; // Silent auth
import sentryBeforeSend from '@misakey/core/helpers/sentry/beforeSend';

/* END OF IMPORTS */

oidcSilentRenewalWrapper(window.env.AUTH, () => {
  if (window.env.ENV !== 'development' || window.env.SENTRY.debug === true) {
    const sentryConfig = window.env.SENTRY;
    if (!isNil(window.bundleVersion)) {
      sentryConfig.release = `frontend@${window.bundleVersion}`;
    }

    sentryConfig.beforeSend = sentryBeforeSend;

    Sentry.init(sentryConfig);
  }

  const rootNode = document.getElementById('root');

  configureI18n();

  // STORE
  const storeMiddleWares = [thunk];
  if (window.env.ENV === 'development') { storeMiddleWares.push(createLogger()); }

  const rootPersistConfig = { key: 'root', storage, whitelist: ['global', 'devicePreferences'] };
  const persistedReducer = persistReducer(rootPersistConfig, reducers);
  const store = createStore(persistedReducer, compose(applyMiddleware(...storeMiddleWares)));
  const persistor = persistStore(store);

  // ADD MIDDLEWARE TO API
  API.addMiddleware(floodManagementAlertMiddleware(100)); // 100ms delay

  // SPLASH SCREEN CONFIG
  const SPLASH_SCREEN_PROPS = { height: '100vh', width: '100vw' };

  ReactDOM.render((
    <Suspense fallback={(
      <ThemeProviderNoStore>
        <SplashScreen {...SPLASH_SCREEN_PROPS} loading />
      </ThemeProviderNoStore>
    )}
    >
      <StoreProvider store={store}>
        <PersistGate
          loading={(
            <SplashScreenWithTranslation {...SPLASH_SCREEN_PROPS} />)}
          persistor={persistor}
        >
          <ThemeProvider>
            <RouterWithCustomConfirm>
              <SnackbarProvider>
                <OfflineContextProvider addMiddleware={API.addMiddleware}>
                  <ErrorBoundary maxWidth="md" my={3} component={ScreenError}>
                    <OidcProvider
                      config={window.env.AUTH}
                      redirectProps={{
                        fallbackReferrer: routes._,
                        loadingPlaceholder: <Screen isLoading />,
                      }}
                    >
                      <App />
                    </OidcProvider>
                  </ErrorBoundary>
                </OfflineContextProvider>
              </SnackbarProvider>
            </RouterWithCustomConfirm>
          </ThemeProvider>
        </PersistGate>
      </StoreProvider>
    </Suspense>
  ), rootNode);

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: http://bit.ly/CRA-PWA
  serviceWorker.unregister();
});
