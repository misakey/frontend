Form Field Rating example:

**NB**: This component relies on a `material-ui/lab` component
> "This package hosts the incubator components that are not yet ready to move to the core"

```js
import React, { useCallback } from 'react';
import { Formik, Form, Field } from 'formik';
import RatingField from '@misakey/ui/Form/Field/Rating';
import log from '@misakey/helpers/log';

const INITIAL_VALUES = {
  value: null,
};

const RatingFieldExample = () => {
  const onSubmit = useCallback(
    (values, actions) => { log(values); actions.setSubmitting(false); },
    [],
  );

  return (
    <Formik initialValues={INITIAL_VALUES} onSubmit={onSubmit}>
      {({ isSubmitting, isValid }) => (
        <Form>
          <Field component={RatingField} name="value" />
          <div>
submitting
            {isSubmitting}
          </div>
          <div>
valid
            {isValid}
          </div>
          <button type="submit">
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};
  <RatingFieldExample />;
```
