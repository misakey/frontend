import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import omit from '@misakey/helpers/omit';
import withErrors from '@misakey/ui/Form/Field/withErrors';

const FieldCheckbox = ({
  displayError, errorKeys, field, form, helperText, label, t, ...rest
}) => (
  <FormControl error={displayError}>
    <FormGroup>
      <FormControlLabel
        control={(
          <Checkbox
            checked={field.value}
            onChange={() => form.setFieldValue(field.name, !field.value)}
            {...field}
            {...omit(rest, ['i18n', 'tReady', 'form'])}
          />
          )}
        label={label}
      />
      {(displayError || helperText) && (
      <FormHelperText>{displayError ? t(errorKeys) : helperText}</FormHelperText>
      )}
    </FormGroup>
  </FormControl>
);

FieldCheckbox.propTypes = {
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.bool,
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  helperText: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.object]),
  t: PropTypes.func.isRequired,
};

FieldCheckbox.defaultProps = {
  className: '',
  helperText: '',
  label: '',
};

export default withTranslation('fields')(withErrors(FieldCheckbox));
