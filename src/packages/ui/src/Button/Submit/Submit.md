ButtonSubmit example:

```js
import React from 'react';
import { Formik } from 'formik';
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
