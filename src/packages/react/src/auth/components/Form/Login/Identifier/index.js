import React from 'react';
import { STEP } from '@misakey/core/auth/constants';
import { AUTOFILL_USERNAME } from '@misakey/ui/constants/autofill';


import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import Field from '@misakey/ui/Form/Field';

// CONSTANTS
const SUFFIX = 'email';

const INPUT_PROPS = {
  'data-matomo-ignore': true,
  ...AUTOFILL_USERNAME,
};

// COMPONENTS
const LoginIdentifierFormField = (props) => (
  <Field
    suffix={`:${SUFFIX}`}
    name={STEP.identifier}
    component={FieldText}
    variant="filled"
    type="email"
    inputProps={INPUT_PROPS}
    autoFocus
    {...props}
  />
);

export default LoginIdentifierFormField;
