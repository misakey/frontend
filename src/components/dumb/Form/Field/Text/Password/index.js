import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import useWithErrorsMapper from '@misakey/hooks/useWithErrorsMapper';

import TextFieldStandard from '@misakey/ui/TextField/Standard';
import withErrors from '@misakey/ui/Form/Field/withErrors';

// CONSTANTS
const DEFAULT_INPUT_PROPS = {
  'data-matomo-ignore': true,
};

// COMPONENTS
const FormFieldTextPassword = ({ type, inputProps, ...props }) => {
  const mergedInputProps = useMemo(
    () => ({
      ...inputProps,
      ...DEFAULT_INPUT_PROPS,
    }),
    [inputProps],
  );

  const textFieldProps = useWithErrorsMapper(props);

  return (
    <TextFieldStandard {...textFieldProps} type={type} inputProps={mergedInputProps} />
  );
};

FormFieldTextPassword.propTypes = {
  type: PropTypes.string,
  inputProps: PropTypes.object,
};

FormFieldTextPassword.defaultProps = {
  type: 'password',
  inputProps: {},
};

export default withErrors(FormFieldTextPassword);
