Wrapper example
```js
import React, { forwardRef } from 'react';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import { Provider as StoreProvider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { createStore, combineReducers } from 'redux';
import authReducers from '../../../../store/reducers';

import ButtonConnectWrapper from './index';

const AccountLink = forwardRef((props, ref) => (
  <Link ref={ref} to="/account" {...props} />
));

const store = createStore(combineReducers(authReducers));

const ButtonConnectExample = () => (
  <StoreProvider store={store}>
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Router>
        <ButtonConnectWrapper
          AccountLink={AccountLink}
        />
      </Router>
    </SnackbarProvider>
  </StoreProvider>
);

  <ButtonConnectExample />;
```
