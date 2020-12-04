RedirectAuthCallback example, (no visible component)
```js

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider as StoreProvider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { createStore, combineReducers } from 'redux';
import authReducers from '../../../store/reducers';

import RedirectAuthCallback from './index';

const store = createStore(combineReducers(authReducers));

const REFFERERS = {
  success: '/success',
  error: '/error',
};

const RedirectAuthCallbackExample = () => (
  <StoreProvider store={store}>
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Router>
        <Route
          path="/callback"
          render={(routerProps) => (
            <RedirectAuthCallback
              fallbackReferrers={REFFERERS}
              handleSuccess={(user) => console.log(user)}
              handleError={(error) => console.log(error)}
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
