import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

import omit from '@misakey/helpers/omit';

import withErrors from '@misakey/ui/Form/Field/withErrors';

const useStyles = makeStyles(() => ({
  hidden: {
    display: 'none',
  },
}));

const FieldText = (props) => {
  const classes = useStyles();
  const { className, displayError, errorKeys, field, helperText, hidden, t, ...rest } = props;

  return (
    <TextField
      margin="normal"
      classes={{ root: hidden && classes.hidden }}
      fullWidth
      variant="outlined"
      className={clsx('FieldText', className)}
      {...field}
      {...omit(rest, ['i18n', 'tReady'])}
      error={displayError}
      helperText={displayError ? t(errorKeys) : helperText}
    />
  );
};

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

export default withErrors(withTranslation()(FieldText));
