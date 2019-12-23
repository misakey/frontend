```js
import React from 'react';
import BoxMessage from '@misakey/ui/Box/Message';

const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec mollis dolor.';

const BoxMessageExample = () => (
  <React.Suspense fallback="Loading...">
    <BoxMessage text={text} mb={2} />
    <BoxMessage text={text} type="error" mb={2} />
    <BoxMessage text={text} type="info" mb={2} />
    <BoxMessage text={text} type="success" mb={2} />
    <BoxMessage text={text} type="warning" mb={2} />
  </React.Suspense>
);

  <BoxMessageExample />;
```
