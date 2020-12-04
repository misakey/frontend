FileField example:

```js

import { Suspense } from 'react';
import FileField from './index';

const ACCEPTED_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/gif',
];

const onChange = console.log;

const FileFieldExample = () => (
  <Suspense fallback="Loading...">
    <FileField
      accept={ACCEPTED_TYPES}
      onChange={onChange}
    />
  </Suspense>
);

  <FileFieldExample />;
```
