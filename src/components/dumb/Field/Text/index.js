import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import TextField from '@material-ui/core/TextField';

// @FIXME refactor @misaey/ui
const FieldText = (props) => {
  const {
    className, helperText, ...rest
  } = props;

  return (
    <TextField
      margin="normal"
      fullWidth
      variant="outlined"
      className={clsx('FieldText', className)}
      {...rest}
      helperText={helperText}
    />
  );
};

FieldText.propTypes = {
  className: PropTypes.string,
  helperText: PropTypes.string,
  t: PropTypes.func.isRequired,
};

FieldText.defaultProps = {
  className: '',
  helperText: '',
};

export default FieldText;
