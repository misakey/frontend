import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Slider from '@material-ui/core/Slider';
import withErrors from 'components/dumb/Form/Field/withErrors';

// HOOKS
const useStyles = makeStyles((theme) => ({
  formControlRoot: {
    padding: theme.spacing(0, 2),
    boxSizing: 'border-box',
  },
}));

// COMPONENTS
// @UNUSED for now, but to keep for future use:
// multiple notifications config in a single screen
const FieldSlider = ({
  displayError, errorKeys, field: { name }, form, helperText, t, ...rest
}) => {
  const classes = useStyles();

  const onChange = useCallback(
    (event, value) => {
      form.setFieldValue(name, value);
    },
    [name, form],
  );

  return (
    <FormControl
      classes={{ root: classes.formControlRoot }}
      error={displayError}
      fullWidth
      margin="normal"
    >
      <Slider
        name={name}
        onChange={onChange}
        {...omitTranslationProps(rest)}
      />
      {(displayError || helperText) && (
        <FormHelperText>{displayError ? t(errorKeys) : helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

FieldSlider.propTypes = {
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number,
  }).isRequired,
  form: PropTypes.shape({
    setFieldTouched: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  helperText: PropTypes.string,
  t: PropTypes.func.isRequired,
};

FieldSlider.defaultProps = {
  className: '',
  helperText: '',
};

export default withTranslation('fields')(withErrors(FieldSlider));
