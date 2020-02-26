import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { STEP, SECLEVEL_CONFIG, DEFAULT_SECLEVEL } from 'constants/auth';

import pick from '@misakey/helpers/pick';
import isEmpty from '@misakey/helpers/isEmpty';

import FieldText from 'components/dumb/Form/Field/Text';
import Fields from '@misakey/ui/Form/Fields';


// CONSTANTS
const DEFAULT_FIELDS = {
  [STEP.identifier]: { component: FieldText, type: 'email', inputProps: { 'data-matomo-ignore': true }, autoFocus: true },
  [STEP.secret]: { component: FieldText, type: 'password', inputProps: { 'data-matomo-ignore': true }, autoFocus: true },
};

// COMPONENTS
const SignInFormFields = ({ step, acr }) => {
  const secLevelConfig = useMemo(() => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL], [acr]);

  const prefix = useMemo(
    () => secLevelConfig.fieldTypes[step], [secLevelConfig, step],
  );

  const defaultFields = useMemo(
    () => pick([step], DEFAULT_FIELDS),
    [step],
  );

  const secLevelConfigFields = useMemo(
    () => pick([step], secLevelConfig.fieldProps),
    [step, secLevelConfig],
  );

  const fields = useMemo(
    () => (isEmpty(secLevelConfigFields) ? defaultFields : secLevelConfigFields),
    [secLevelConfigFields, defaultFields],
  );

  return (
    <Fields
      fields={fields}
      prefix={`${prefix}_`}
      defaultFields={DEFAULT_FIELDS}
    />
  );
};


SignInFormFields.propTypes = {
  step: PropTypes.oneOf(Object.values(STEP)).isRequired,
  acr: PropTypes.number,
};

SignInFormFields.defaultProps = {
  acr: null,
};

export default SignInFormFields;
