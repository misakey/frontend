import React from 'react';

import { STEP } from '@misakey/auth/constants';


import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import Fields from '@misakey/ui/Form/Fields';

// CONSTANTS
const PREFIX = 'email';

const DEFAULT_FIELDS = {
  [STEP.identifier]: {
    component: FieldText,
    variant: 'standard',
    type: 'email',
    inputProps: {
      'data-matomo-ignore': true,
      id: `${PREFIX}_${STEP.identifier}`,
      autocomplete: 'username',
    },
    autoFocus: true,
  },
};

// COMPONENTS
const LoginIdentifierFormFields = (props) => (
  <Fields
    fields={DEFAULT_FIELDS}
    prefix={`${PREFIX}_`}
    defaultFields={DEFAULT_FIELDS}
    {...props}
  />
);

export default LoginIdentifierFormFields;
