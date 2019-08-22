import React from 'react';
import ReactDOM from 'react-dom';

// STORE
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider as StoreProvider } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import reducers from 'store/reducers';

// MIDDLEWARES
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import APITokenMiddleware from '@misakey/auth/middlewares/APItoken';

// ROUTING
import { BrowserRouter as Router } from 'react-router-dom';
import * as serviceWorker from 'serviceWorker';

// UI
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from '@misakey/ui/theme';

// COMPONENTS
import App from 'components/App';
import SplashScreen from 'components/dumb/SplashScreen';
import i18n from 'i18next';

// TRANSLATIONS
import '@misakey/ui/i18n';
import FRCommon from 'constants/locales/fr/common';
import FRFields from 'constants/locales/fr/fields';

i18n.addResourceBundle('fr', 'common', FRCommon, true, true);
i18n.addResourceBundle('fr', 'fields', FRFields, true, true);

/* ============================================================================================== */

const middleWares = [thunk, APITokenMiddleware];
if (!!process && process.env.NODE_ENV === 'development') { middleWares.push(createLogger()); }

const rootPersistConfig = { key: 'root', storage, whitelist: ['global'], blacklist: ['auth'] };
const persistedReducer = persistReducer(rootPersistConfig, reducers);
const store = createStore(persistedReducer, compose(applyMiddleware(...middleWares)));
const persistor = persistStore(store);

ReactDOM.render((
  <React.Suspense fallback={null}>
    <StoreProvider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <MuiThemeProvider theme={theme}>
          <Router>
            <App />
          </Router>
        </MuiThemeProvider>
      </PersistGate>
    </StoreProvider>
  </React.Suspense>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();

export { store as default };
