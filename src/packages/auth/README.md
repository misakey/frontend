### @misakey/auth

#### Install

```shell
yarn add @misakey/auth
```

#### Add auth reducers

You can either:
1. import one by one the reducers you want
2. import all the reducers and combine them your way

###### 1 - import one by one the reducers you want

In your main reducers file
<!-- eslint-skip -->
```js static
import { combineReducers } from 'redux';

import auth from '@misakey/auth/store/reducers/auth';

const rootReducer = combineReducers({
  auth
  // ...
});

export default rootReducer;
```


###### 2 - import all the reducers and combine them your way

In your main reducers file
<!-- eslint-skip -->
```js static
import { combineReducers } from 'redux';

import reducers from '@misakey/auth/store/reducers';

// ...

const rootReducer = combineReducers({
  ...reducers,
  // ...
});

export default rootReducer;
```


#### Integrate reducers and middleware

In your main app file
<!-- eslint-skip -->
```js static

// Redux
import { Provider as StoreProvider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import reducers from 'store/reducers';

// Persistence
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Middlewares
import APITokenMiddleware from '@misakey/auth/middlewares/APItoken';

// Silent auth 
import {
  isSilentAuthIframe,
  processSilentAuthCallbackInIframe,
} from 'auth/helpers';

// OIDC provider
import OidcProvider from '@misakey/auth/components/OidcProvider';

// The main purpose of the iframe is to launch auth request and update user
// in localStorage when the request is finished. It doesn't need to load the
// rest of the application and if it does, the iframe can throw timeout errors
// https://github.com/maxmantz/redux-oidc/issues/48#issuecomment-315422236
if (isSilentAuthIframe()) {
  processSilentAuthCallbackInIframe();
} else {
  const middleWares = [APITokenMiddleware]; // + your other middlewares
  const rootPersistConfig = { 
    key: 'root', 
    storage, 
    whitelist: ['global'], 
    blacklist: [] 
  };
  const persistedReducer = persistReducer(rootPersistConfig, reducers);
  const store = createStore(
    persistedReducer, 
    compose(applyMiddleware(...middleWares))
  );
  const persistor = persistStore(store);

  const oidcConfig = {
    authority: 'https://auth.misakey.com.local/',
    client_id: '<client_id>',
    redirect_uri: 'https://api.misakey.com.local/app/auth/callback',
  }

  ReactDOM.render((
      <StoreProvider store={store}>
        <OidcProvider store={store} config={oidcConfig}>
          <PersistGate persistor={persistor}>
            {/* ... */}
          </PersistGate>
        </OidcProvider>
      </StoreProvider>
    </React.Suspense>
  ), document.getElementById('root'));
}
```