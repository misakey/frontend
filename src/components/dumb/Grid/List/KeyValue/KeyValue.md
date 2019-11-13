```js
import React from 'react';
import { SnackbarProvider } from 'notistack';

import GridListKeyValue from 'components/dumb/Grid/List/KeyValue';

const entity = {
  firstName: 'Rose',
  lastName: 'Flamingo',
  email: 'rose.flamingo@misakey.com',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lobortis dolor vitae felis accumsan pharetra. Nullam malesuada turpis ac ultricies facilisis.',
  favorite: {
    color: '#ce0059',
    food: 'Shrimps !',
    website: 'misakey.com',
  },
  postalAddress: {
    street: '69 rue de la république',
    zipCode: '69002',
    city: 'Lyon',
  },
};

const GridListKeyValueExample = () => (
  <React.Suspense fallback="Loading...">
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <GridListKeyValue object={entity} cols={2} />
    </SnackbarProvider>
  </React.Suspense>
);

  <GridListKeyValueExample />;
```
