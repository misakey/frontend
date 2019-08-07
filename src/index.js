// React
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from 'serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';

// Redux
import { Provider as StoreProvider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import reducers from 'store/reducers';

// Persistence
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Middlewares
import APITokenMiddleware from 'middlewares/APItoken';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

// Theme & styles
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import theme from '@misakey/ui/theme';

// Translations
import 'i18n';

// Components
import App from 'components/App';
import SplashScreen from 'components/dumb/SplashScreen';

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
        <MuiThemeProvider theme={createMuiTheme(theme)}>
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
