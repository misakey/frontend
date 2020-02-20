import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import FieldText from 'components/dumb/Form/Field/Text';
import Fields, { FIELD_PROPTYPES } from '@misakey/ui/Form/Fields';

import { STEP, SECLEVEL_CONFIG, DEFAULT_SECLEVEL } from 'components/smart/Auth/SignIn/Form/constants';


const defaultProps = {
  [STEP.identifier]: { component: FieldText, type: 'email', inputProps: { 'data-matomo-ignore': true }, autoFocus: true },
  [STEP.secret]: { component: FieldText, type: 'password', inputProps: { 'data-matomo-ignore': true }, autoFocus: true },
};

const SignInFormFields = ({ step, acr, ...fields }) => {
  const prefix = useMemo(
    () => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL].fieldTypes[step], [acr, step],
  );
  return (
    <Fields
      fields={{ [step]: { ...fields[step] } }}
      prefix={`${prefix}_`}
      defaultFields={defaultProps}
    />
  );
};


SignInFormFields.propTypes = {
  identifier: FIELD_PROPTYPES,
  secret: FIELD_PROPTYPES,
  step: PropTypes.oneOf(Object.values(STEP)).isRequired,
  acr: PropTypes.number,
};

SignInFormFields.defaultProps = {
  ...defaultProps,
  acr: null,
};

export default SignInFormFields;
