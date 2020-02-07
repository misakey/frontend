import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import TextField from '@material-ui/core/TextField';
import omit from '@misakey/helpers/omit';

import withErrors from '../withErrors';

const FieldText = ({
  className, displayError, errorKeys, field,
  helperText, hidden, t, ...rest
}) => (
  <TextField
    margin="normal"
    fullWidth
    variant="outlined"
    className={clsx('FieldText', className)}
    {...field}
    {...omit(rest, ['i18n', 'tReady', 'form', 'prefix'])}
    error={displayError}
    helperText={displayError ? t(errorKeys) : helperText}
  />
);

FieldText.propTypes = {
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  helperText: PropTypes.string,
  hidden: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

FieldText.defaultProps = {
  className: '',
  helperText: '',
  hidden: false,
};

export default withTranslation('fields')(withErrors(FieldText));
