ButtonSubmit example:

```js
import React from 'react';
import Formik from '@misakey/ui/Formik';
import ButtonSubmit from './index';

const ButtonSubmitExample = () => (
  <React.Suspense fallback="Loading...">
    <Formik>
      <ButtonSubmit text="Submit" />
    </Formik>
  </React.Suspense>
);

  <ButtonSubmitExample />;
```
