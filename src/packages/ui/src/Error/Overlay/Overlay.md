```js
import React from 'react';
import ErrorOverlay from '@misakey/ui/Error/Overlay';

const ErrorOverlayExample = () => (
  <React.Suspense fallback="Loading...">
    <ErrorOverlay httpStatus={404} />
  </React.Suspense>
);

  <ErrorOverlayExample />;
```
