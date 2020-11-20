import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import useWithErrorsMapper from '@misakey/hooks/useWithErrorsMapper';

import TextFieldPassword from '@misakey/ui/TextField/Password';
import withErrors from '@misakey/ui/Form/Field/withErrors';

// CONSTANTS
const DEFAULT_INPUT_PROPS = {
  'data-matomo-ignore': true,
};

// COMPONENTS
const FormFieldPassword = ({ inputProps, ...props }) => {
  const mergedInputProps = useMemo(
    () => ({
      ...inputProps,
      ...DEFAULT_INPUT_PROPS,
    }),
    [inputProps],
  );

  const textFieldProps = useWithErrorsMapper(props);

  return (
    <TextFieldPassword {...textFieldProps} inputProps={mergedInputProps} />
  );
};

FormFieldPassword.propTypes = {
  inputProps: PropTypes.object,
};

FormFieldPassword.defaultProps = {
  inputProps: {},
};

export default withErrors(FormFieldPassword);
