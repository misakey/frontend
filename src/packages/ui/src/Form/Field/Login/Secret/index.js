import { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { STEP } from '@misakey/auth/constants';
import { EMAILED_CODE, PREHASHED_PASSWORD, ACCOUNT_CREATION, METHODS } from '@misakey/auth/constants/method';

import prop from '@misakey/helpers/prop';

import Field from '@misakey/ui/Form/Field';
import FieldCodePasteButton from '@misakey/ui/Form/Field/Code/WithPasteButton';
import FieldPasswordRevealable from '@misakey/ui/Form/Field/Password/Revealable';

// CONSTANTS
const FIELD_PROPS = {
  [EMAILED_CODE]: {
    component: FieldCodePasteButton,
    variant: 'filled',
    fullWidth: true,
    autoFocus: true,
    inputProps: {
      id: `${EMAILED_CODE}_${STEP.secret}`,
    },
  },
  [PREHASHED_PASSWORD]: {
    component: FieldPasswordRevealable,
    variant: 'filled',
    type: 'password',
    autoFocus: true,
    inputProps: {
      'data-matomo-ignore': true,
      id: `${PREHASHED_PASSWORD}_${STEP.secret}`,
      autoComplete: 'current-password',
    },
  },
  [ACCOUNT_CREATION]: {
    component: FieldPasswordRevealable,
    variant: 'filled',
    type: 'password',
    autoFocus: true,
    inputProps: {
      'data-matomo-ignore': true,
      id: `${ACCOUNT_CREATION}_${STEP.secret}`,
      autoComplete: 'new-password',
    },
  },

};

// COMPONENTS
const LoginSecretFormFields = ({ methodName, methodNameClasses, className, ...rest }) => {
  const fieldProps = useMemo(
    () => prop(methodName, FIELD_PROPS),
    [methodName],
  );

  const fieldClassName = useMemo(
    () => prop(methodName, methodNameClasses),
    [methodName, methodNameClasses],
  );

  return (
    <Field
      className={clsx(className, fieldClassName)}
      name={STEP.secret}
      prefix={`${methodName}_`}
      {...fieldProps}
      {...rest}
    />
  );
};


LoginSecretFormFields.propTypes = {
  methodNameClasses: PropTypes.shape({
    [EMAILED_CODE]: PropTypes.string,
    [PREHASHED_PASSWORD]: PropTypes.string,
    [ACCOUNT_CREATION]: PropTypes.string,
  }),
  className: PropTypes.string,
  methodName: PropTypes.oneOf(METHODS).isRequired,
};

LoginSecretFormFields.defaultProps = {
  methodNameClasses: {},
  className: '',
};

export default LoginSecretFormFields;
