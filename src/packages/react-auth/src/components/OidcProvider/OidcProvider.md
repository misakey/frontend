In your main app file
<!-- eslint-skip -->
```js static
import { Suspense } from 'react';

import OidcProvider from 'auth/components/OidcProvider';
import { createStore } from 'redux';

const store = createStore(
  persistedReducer, 
  compose(applyMiddleware(...middleWares))
);
const oidcConfig = {
  authority: 'https://auth.misakey.com.local/',
  client_id: '<client_id>',
  redirect_uri: 'https://api.misakey.com.local/app/auth/callback',
}

ReactDOM.render((
  <Suspense>
    <StoreProvider store={store}>
      <OidcProvider store={store} config={oidcConfig}>
      </OidcProvider>
    </StoreProvider>
  </Suspense>
), document.getElementById('root'));

```