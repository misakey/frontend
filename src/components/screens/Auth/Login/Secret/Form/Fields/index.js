import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { STEP } from 'constants/auth';
import { EMAILED_CODE, PASSWORD, METHODS } from '@misakey/auth/constants/method';

import prop from '@misakey/helpers/prop';

import Fields from '@misakey/ui/Form/Fields';
import FieldCode from 'components/dumb/Form/Field/Code';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';

// CONSTANTS
const DEFAULT_FIELDS = {
  [EMAILED_CODE]: {
    [STEP.secret]: {
      component: FieldCode,
      autoFocus: true,
      inputProps: {
        id: `${EMAILED_CODE}_${STEP.secret}`,
      },
    },
  },
  [PASSWORD]: {
    [STEP.secret]: {
      component: FieldTextPasswordRevealable,
      variant: 'standard',
      type: 'password',
      autoFocus: true,
      inputProps: {
        'data-matomo-ignore': true,
        id: `${PASSWORD}_${STEP.secret}`,
      },
    },
  },
};

// COMPONENTS
const LoginSecretFormFields = ({ methodName }) => {
  const defaultFields = useMemo(
    () => prop(methodName, DEFAULT_FIELDS),
    [methodName],
  );

  return (
    <Fields
      fields={defaultFields}
      prefix={`${methodName}_`}
      defaultFields={defaultFields}
    />
  );
};


LoginSecretFormFields.propTypes = {
  methodName: PropTypes.oneOf(METHODS).isRequired,
};

export default LoginSecretFormFields;
