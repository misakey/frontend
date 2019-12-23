```js
import React from 'react';
import { Formik, Form, Field } from 'formik';
import FieldCode from 'components/dumb/Form/Field/Code';
import ButtonSubmit from 'components/dumb/Button/Submit';
import log from '@misakey/helpers/log';

const NAME = 'code';
const initialValues = { [NAME]: '' };

const FieldCodeExample = () => (
  <React.Suspense fallback="Loading...">
    <Formik onSubmit={(values) => log(values[NAME])} initialValues={initialValues}>
      <Form>
        <Field component={FieldCode} name="code" label="My super label" />
        <div><ButtonSubmit /></div>
      </Form>
    </Formik>
  </React.Suspense>
);

  <FieldCodeExample />;
```
