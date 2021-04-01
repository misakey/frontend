#### Image

```js

import React from 'react';

import authReducers from '@misakey/react/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import lemur from '@misakey/ui/lemur';
import { Provider as StoreProvider } from 'react-redux';

import CardUser from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: { identity: {
    displayName: 'Toto Test',
    identifier: 'toto.test@misakey.com',
    avatarUrl: lemur,
  } } },
);

const CardUserExample = () => (
  <StoreProvider store={store}>
    <CardUser />
  </StoreProvider>
);

  <CardUserExample />;
```


#### Letter

```js
import React from 'react';


import authReducers from '@misakey/react/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import { Provider as StoreProvider } from 'react-redux';

import CardUser from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: { identity: {
    displayName: 'Toto Test',
    identifier: 'toto.test@misakey.com',
  } } },
);

const CardUserExample = () => (
  <StoreProvider store={store}>
    <CardUser />
  </StoreProvider>
);

  <CardUserExample />;
```

#### Empty

```js
import React from 'react';


import authReducers from '@misakey/react/auth/store/reducers';

import { createStore, combineReducers } from 'redux';

import { Provider as StoreProvider } from 'react-redux';

import CardUser from './index';

const store = createStore(
  combineReducers(authReducers),
  { auth: {} },
);

const CardUserExample = () => (
  <StoreProvider store={store}>
    <CardUser />
  </StoreProvider>
);

  <CardUserExample />;
```
