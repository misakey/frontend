#### Image

```js
import React from 'react';

import authReducers from '@misakey/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import lemur from '@misakey/ui/lemur';
import { Provider as StoreProvider } from 'react-redux';

import CardUserSignOut from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: { identity: {
    displayName: 'Toto Test',
    identifier: 'toto.test@misakey.com',
    avatarUrl: lemur,
  } } },
);

const CardUserSignOutExample = () => (
  <StoreProvider store={store}>
    <CardUserSignOut />
  </StoreProvider>
);

  <CardUserSignOutExample />;
```


#### Letter

```js
import React from 'react';

import authReducers from '@misakey/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import { Provider as StoreProvider } from 'react-redux';

import CardUserSignOut from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: { identity: {
    displayName: 'Toto Test',
    identifier: 'toto.test@misakey.com',
  } } },
);

const CardUserSignOutExample = () => (
  <StoreProvider store={store}>
    <CardUserSignOut />
  </StoreProvider>
);

  <CardUserSignOutExample />;
```

#### Empty

```js
import React from 'react';

import authReducers from '@misakey/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import { Provider as StoreProvider } from 'react-redux';

import CardUserSignOut from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: {} },
);

const CardUserSignOutExample = () => (
  <StoreProvider store={store}>
    <CardUserSignOut />
  </StoreProvider>
);

  <CardUserSignOutExample />;
```