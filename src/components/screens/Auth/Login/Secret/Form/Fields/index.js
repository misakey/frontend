import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { STEP } from '@misakey/auth/constants';
import { EMAILED_CODE, PREHASHED_PASSWORD, ACCOUNT_CREATION, METHODS } from '@misakey/auth/constants/method';

import prop from '@misakey/helpers/prop';

import Fields from '@misakey/ui/Form/Fields';
import FieldCodePasteButton from 'components/dumb/Form/Field/Code/WithPasteButton';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';

// CONSTANTS
const DEFAULT_FIELDS = {
  [EMAILED_CODE]: {
    [STEP.secret]: {
      component: FieldCodePasteButton,
      autoFocus: true,
      inputProps: {
        id: `${EMAILED_CODE}_${STEP.secret}`,
      },
    },
  },
  [PREHASHED_PASSWORD]: {
    [STEP.secret]: {
      component: FieldTextPasswordRevealable,
      variant: 'standard',
      type: 'password',
      autoFocus: true,
      inputProps: {
        'data-matomo-ignore': true,
        id: `${PREHASHED_PASSWORD}_${STEP.secret}`,
        autoComplete: 'current-password',
      },
    },
  },
  [ACCOUNT_CREATION]: {
    [STEP.secret]: {
      component: FieldTextPasswordRevealable,
      variant: 'standard',
      type: 'password',
      autoFocus: true,
      inputProps: {
        'data-matomo-ignore': true,
        id: `${ACCOUNT_CREATION}_${STEP.secret}`,
        autoComplete: 'new-password',
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
