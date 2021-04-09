import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import { STEP } from '@misakey/core/auth/constants';
import {
  IDENTITY_PASSWORD,
  IDENTITY_EMAILED_CODE,
  WEBAUTHN,
  TOTP,
  TOTP_RECOVERY,
} from '@misakey/core/auth/constants/amr';
import { AUTOFILL_PASSWORD, AUTOFILL_CODE } from '@misakey/ui/constants/autofill';
import { PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';

import prop from '@misakey/core/helpers/prop';
import isNil from '@misakey/core/helpers/isNil';

import Field from '@misakey/ui/Form/Field';
import FieldCodePasteButton from '@misakey/ui/Form/Field/Code/WithPasteButton';
import FieldPasswordRevealable from '@misakey/ui/Form/Field/Password/Revealable';
import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';

import WebauthnLogin from '../Webauthn';

// CONSTANTS
const FIELD_PROPS = {
  [WEBAUTHN]: {
    component: WebauthnLogin,
  },
  [TOTP]: {
    component: FieldCodePasteButton,
    variant: 'filled',
    fullWidth: true,
    autoFocus: true,
    centered: true,
    inputProps: {
      id: `${TOTP}_${STEP.secret}`,
      'data-matomo-ignore': true,
      ...AUTOFILL_CODE,
    },
  },
  [TOTP_RECOVERY]: {
    component: FieldText,
    variant: 'filled',
    fullWidth: true,
    autoFocus: true,
    inputProps: {
      id: `${TOTP_RECOVERY}_${STEP.secret}`,
      type: 'text',
      maxLength: 11,
      pattern: '[0-9a-zA-Z]{5}-[0-9a-zA-Z]{5}',
      style: {
        fontFamily: 'monospace',
        letterSpacing: '1rem',
        fontSize: '2rem',
      },
      autoComplete: 'off',
      'data-matomo-ignore': true,
    },
  },
  [IDENTITY_EMAILED_CODE]: {
    component: FieldCodePasteButton,
    variant: 'filled',
    centered: true,
    fullWidth: true,
    autoFocus: true,
    inputProps: {
      id: `${IDENTITY_EMAILED_CODE}_${STEP.secret}`,
      ...AUTOFILL_CODE,
    },
  },
  [IDENTITY_PASSWORD]: {
    component: FieldPasswordRevealable,
    variant: 'filled',
    type: 'password',
    autoFocus: true,
    inputProps: {
      'data-matomo-ignore': true,
      ...AUTOFILL_PASSWORD,
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

  if (isNil(methodName)) { return null; }

  return (
    <Field
      className={clsx(className, fieldClassName)}
      suffix={`:${methodName}`}
      name={STEP.secret}
      {...fieldProps}
      {...rest}
    />
  );
};


LoginSecretFormFields.propTypes = {
  methodNameClasses: PropTypes.shape({
    [WEBAUTHN]: PropTypes.string,
    [IDENTITY_EMAILED_CODE]: PropTypes.string,
    [IDENTITY_PASSWORD]: PropTypes.string,
    [TOTP_RECOVERY]: PropTypes.string,
    [TOTP]: PropTypes.string,
  }),
  className: PropTypes.string,
  methodName: PROP_TYPES.methodName.isRequired,
};

LoginSecretFormFields.defaultProps = {
  methodNameClasses: {},
  className: '',
};

export default LoginSecretFormFields;
