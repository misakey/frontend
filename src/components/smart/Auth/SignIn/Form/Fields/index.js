import React from 'react';
import PropTypes from 'prop-types';

import FieldText from 'components/dumb/Form/Field/Text';
import Fields, { FIELD_PROPTYPES } from 'components/dumb/Form/Fields';

import { STEP } from 'components/smart/Auth/SignIn/Form/constants';


const defaultProps = {
  email: { component: FieldText, type: 'email', inputProps: { 'data-matomo-ignore': true } },
  password: { component: FieldText, type: 'password', inputProps: { 'data-matomo-ignore': true } },
};

const SignInFormFields = ({ step, ...fields }) => (
  <Fields fields={{ [step]: fields[step] }} prefix="signIn." defaultFields={defaultProps} />
);

SignInFormFields.propTypes = {
  email: FIELD_PROPTYPES,
  password: FIELD_PROPTYPES,
  step: PropTypes.oneOf(Object.values(STEP)).isRequired,
};

SignInFormFields.defaultProps = defaultProps;

export default SignInFormFields;
