RedirectAuthCallback example, (no visible component)
```js
import React from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider as StoreProvider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { createStore, combineReducers } from 'redux';
import authReducers from '../../../store/reducers';

import RedirectAuthCallback from './index';

const store = createStore(combineReducers(authReducers));

const REFFERER = '/success';

const RedirectAuthCallbackExample = () => (
  <StoreProvider store={store}>
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Router>
        <Route
          path="/callback"
          render={(routerProps) => (
            <RedirectAuthCallback
              fallbackReferrer={REFFERER}
              {...routerProps}
            />
          )}
        />
      </Router>
    </SnackbarProvider>
  </StoreProvider>
);

  <RedirectAuthCallbackExample />;
```
