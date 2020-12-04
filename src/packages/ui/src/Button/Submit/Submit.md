ButtonSubmit example:

```js

import { Suspense } from 'react';
import Formik from '@misakey/ui/Formik';
import ButtonSubmit from './index';

const ButtonSubmitExample = () => (
  <Suspense fallback="Loading...">
    <Formik>
      <ButtonSubmit text="Submit" />
    </Formik>
  </Suspense>
);

  <ButtonSubmitExample />;
```
