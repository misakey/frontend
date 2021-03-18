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

import auth from '@misakey/react-auth/store/reducers/auth';

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

import reducers from '@misakey/react-auth/store/reducers';

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

// Silent auth 
import oidcSilentRenewalWrapper from '@misakey/auth/helpers/oidcSilentRenewalWrapper'; 

// OIDC provider
import OidcProvider from '@misakey/react-auth/components/OidcProvider';


const oidcConfig = {
  authority: 'https://auth.misakey.com.local/',
  client_id: '<client_id>',
  redirect_uri: 'https://api.misakey.com.local/app/auth/callback',
}

oidcSilentRenewalWrapper(oidcConfig, () => {
  const rootPersistConfig = { 
    key: 'root', 
    storage, 
    whitelist: ['global'], 
    blacklist: [] 
  };
  const persistedReducer = persistReducer(rootPersistConfig, reducers);
  const store = createStore(persistedReducer);
  const persistor = persistStore(store);

  ReactDOM.render((
      <StoreProvider store={store}>
        <OidcProvider store={store} config={oidcConfig}>
          <PersistGate persistor={persistor}>
            {/* ... */}
          </PersistGate>
        </OidcProvider>
      </StoreProvider>
  ), document.getElementById('root'));
});
```
