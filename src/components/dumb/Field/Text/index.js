import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import TextField from '@material-ui/core/TextField';
import omit from '@misakey/helpers/omit';

// @FIXME refactor @misaey/ui
const FieldText = (props) => {
  const {
    className, helperText, t, ...rest
  } = props;

  return (
    <TextField
      margin="normal"
      fullWidth
      variant="outlined"
      className={clsx('FieldText', className)}
      {...omit(rest, ['i18n', 'tReady'])}
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

export default withTranslation('fields')(FieldText);
