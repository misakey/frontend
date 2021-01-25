import React from 'react';
import PropTypes from 'prop-types';

import useWithErrorsMapper from '@misakey/hooks/useWithErrorsMapper';

import TextField from '@misakey/ui/TextField';
import withErrors from '@misakey/ui/Form/Field/withErrors';

const FormFieldTextFieldWithErrors = (props) => {
  const textFieldProps = useWithErrorsMapper(props);
  return (
    <TextField
      {...textFieldProps}
    />
  );
};

FormFieldTextFieldWithErrors.propTypes = {
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  helperText: PropTypes.string,
};

FormFieldTextFieldWithErrors.defaultProps = {
  className: '',
  helperText: '',
};

export default withErrors(FormFieldTextFieldWithErrors);
