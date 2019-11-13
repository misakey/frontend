```js
import React from 'react';
import { SnackbarProvider } from 'notistack';

import Color from 'components/dumb/Color';
import ceriseRed from '@misakey/ui/colors/ceriseRed';
import boulder from '@misakey/ui/colors/boulder';

const ColorExample = () => (

  <React.Suspense fallback="Loading...">
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Color color={ceriseRed[400]} mr={3} />
      {' '}
      <Color color={boulder.A100} enableCopy />
    </SnackbarProvider>
  </React.Suspense>
);

  <ColorExample />;
```
