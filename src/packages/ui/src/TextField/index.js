import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import MuiTextField from '@material-ui/core/TextField';

// COMPONENTS
const TextField = ({ id, name, ...props }) => {
  const idOrNameId = useMemo(
    () => id || name,
    [id, name],
  );

  return (
    <MuiTextField
      margin="normal"
      fullWidth
      variant="outlined"
      id={idOrNameId}
      name={name}
      {...props}
    />
  );
};

TextField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  helperText: PropTypes.string,
};

TextField.defaultProps = {
  id: '',
  name: '',
  className: '',
  helperText: '',
};

export default TextField;
