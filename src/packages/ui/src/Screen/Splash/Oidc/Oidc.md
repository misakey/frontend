#### Image

```js
import React from 'react';
import authReducers from '@misakey/react/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import lemur from '@misakey/ui/lemur';
import { Provider as StoreProvider } from 'react-redux';

import ScreenSplashOidc from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: { identity: {
    displayName: 'Toto Test',
    identifier: 'toto.test@misakey.com',
    avatarUrl: lemur,
  } } },
);

const ScreenSplashOidcExample = () => (
  <StoreProvider store={store}>
    <ScreenSplashOidc />
  </StoreProvider>
);

  <ScreenSplashOidcExample />;
```


#### Letter

```js

import React from 'react';

import authReducers from '@misakey/react/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import { Provider as StoreProvider } from 'react-redux';

import ScreenSplashOidc from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: { identity: {
    displayName: 'Toto Test',
    identifier: 'toto.test@misakey.com',
  } } },
);

const ScreenSplashOidcExample = () => (
  <StoreProvider store={store}>
    <ScreenSplashOidc />
  </StoreProvider>
);

  <ScreenSplashOidcExample />;
```

#### Empty

```js

import React from 'react';

import authReducers from '@misakey/react/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import { Provider as StoreProvider } from 'react-redux';

import ScreenSplashOidc from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: {} },
);

const ScreenSplashOidcExample = () => (
  <StoreProvider store={store}>
    <ScreenSplashOidc />
  </StoreProvider>
);

  <ScreenSplashOidcExample />;
```
