import React from 'react';

import { STEP } from 'constants/auth';

import FieldText from 'components/dumb/Form/Field/Text';
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
