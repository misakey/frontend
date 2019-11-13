import React from 'react';

import FieldText from 'components/dumb/Form/Field/Text';
import Fields from 'components/dumb/Form/Fields';

const defaultProps = {
  code: { component: FieldText, inputProps: { 'data-matomo-ignore': true } },
};

const SignUpConfirmFormFields = (fields) => (
  <Fields fields={fields} prefix="signUpConfirm." defaultFields={defaultProps} />
);

SignUpConfirmFormFields.defaultProps = defaultProps;

export default SignUpConfirmFormFields;
