import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'proxy-polyfill';

import { Suspense } from 'react';
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
import routes from 'routes';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import invalidAccessTokenMiddleware from '@misakey/auth/middlewares/invalidAccessToken';
import invalidCsrfTokenMiddleware from '@misakey/auth/middlewares/invalidCsrfToken';
import floodManagementAlertMiddleware from 'middlewares/floodManagement/alert';
import invalidSeclevelMiddleware from '@misakey/auth/middlewares/invalidSeclevel';
import unauthorizedMiddleware from 'middlewares/unauthorized';
// routing
import Router from 'components/smart/Router';
import * as serviceWorker from 'serviceWorker';
// ui
import ThemeProvider from 'components/smart/ThemeProvider';
import ThemeProviderNoStore from 'components/smart/ThemeProvider/NoStore';
// components
import App from 'components/App';

import SplashScreen from '@misakey/ui/Screen/Splash';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import OidcProvider from '@misakey/auth/components/OidcProvider'; // OIDC provider
import SnackbarProvider from 'components/smart/SnackbarProvider';
import OfflineContextProvider from 'components/smart/Context/Offline';
import ScreenError from 'components/smart/Screen/Error';
import ErrorBoundary from '@misakey/ui/ErrorBoundary';
// translations
import './i18n';
import countries from 'i18n-iso-countries';
// helpers
import isNil from '@misakey/helpers/isNil';
import { isSilentAuthIframe, processSilentAuthCallbackInIframe } from '@misakey/auth/helpers'; // Silent auth

/* END OF IMPORTS */

if (window.env.ENV !== 'development' || window.env.SENTRY.debug === true) {
  const sentryConfig = window.env.SENTRY;
  if (!isNil(window.bundleVersion)) {
    sentryConfig.release = `frontend@${window.bundleVersion}`;
  }

  sentryConfig.beforeSend = (event) => (
    { ...event, request: { ...event.request, url: event.request.url.split('#')[0] } }
  );

  Sentry.init(sentryConfig);
}

const rootNode = document.getElementById('root');

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'));

// The main purpose of the iframe is to launch auth request and update user
// in localStorage when the request is finished. It doesn't need to load the
// rest of the application and if it does, the iframe can throw timeout errors
// https://github.com/maxmantz/redux-oidc/issues/48#issuecomment-315422236
if (isSilentAuthIframe()) {
  processSilentAuthCallbackInIframe();
} else {
  // STORE
  const storeMiddleWares = [thunk];
  if (window.env.ENV === 'development') { storeMiddleWares.push(createLogger()); }

  const rootPersistConfig = { key: 'root', storage, whitelist: ['global', 'devicePreferences'] };
  const persistedReducer = persistReducer(rootPersistConfig, reducers);
  const store = createStore(persistedReducer, compose(applyMiddleware(...storeMiddleWares)));
  const persistor = persistStore(store);

  // ADD MIDDLEWARE TO API
  API.addMiddleware(invalidAccessTokenMiddleware(store.dispatch));
  API.addMiddleware(invalidCsrfTokenMiddleware(API.deleteCsrfToken));
  API.addMiddleware(floodManagementAlertMiddleware(100)); // 100ms delay

  const registerMiddlewares = (askSigninRedirect) => {
    API.addMiddleware(invalidSeclevelMiddleware(askSigninRedirect, store));
    API.addMiddleware(unauthorizedMiddleware(askSigninRedirect, store));
  };

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
            <Router>
              <SnackbarProvider>
                <OfflineContextProvider addMiddleware={API.addMiddleware}>
                  <ErrorBoundary maxWidth="md" my={3} component={ScreenError}>
                    <OidcProvider
                      config={window.env.AUTH}
                      registerMiddlewares={registerMiddlewares}
                      publicRoute={routes.identities.public}
                      // do not try to retrieve old user during auth flow as it useless
                      // and could conflict with current auth flow (autoSignIn if user is expired)
                      autoSignInExcludedRoutes={[routes.auth._, routes.auth.callback]}
                    >
                      <App />
                    </OidcProvider>
                  </ErrorBoundary>
                </OfflineContextProvider>
              </SnackbarProvider>
            </Router>
          </ThemeProvider>
        </PersistGate>
      </StoreProvider>
    </Suspense>
  ), rootNode);

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: http://bit.ly/CRA-PWA
  serviceWorker.unregister();
}
