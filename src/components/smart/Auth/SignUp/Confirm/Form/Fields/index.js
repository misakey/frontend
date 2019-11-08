import React from 'react';

import FieldText from '@misakey/ui/Form/Field/Text';
import Fields from '@misakey/ui/Form/Fields';

const defaultProps = {
  code: { component: FieldText, inputProps: { 'data-matomo-ignore': true } },
};

const SignUpConfirmFormFields = (fields) => (
  <Fields fields={fields} prefix="signUpConfirm." defaultFields={defaultProps} />
);

SignUpConfirmFormFields.defaultProps = defaultProps;

export default SignUpConfirmFormFields;
