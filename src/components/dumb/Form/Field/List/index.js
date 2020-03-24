import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import withErrors from 'components/dumb/Form/Field/withErrors';

// COMPONENTS
const FormFieldList = ({
  component: Component,
  displayError, errorKeys,
  field: { value, name }, form: { setFieldValue, setFieldTouched, submitForm },
  helperText, t, ...rest
}) => {
  const onChange = useCallback(
    (e, change) => {
      setFieldValue(name, change);
      setFieldTouched(name, true, false);
      // setTimeout to ensure setFieldValue and setFieldTouched (they return void)
      // modifications are effective before submitForm
      setTimeout(submitForm, 0);
    },
    [name, setFieldTouched, setFieldValue, submitForm],
  );

  return (
    <FormControl error={displayError} fullWidth>
      <Component
        value={value}
        onChange={onChange}
        {...omitTranslationProps(rest)}
      />
      {(displayError || helperText) && (
        <FormHelperText>{displayError ? t(errorKeys) : helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

FormFieldList.propTypes = {
  component: PropTypes.elementType.isRequired,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
  }).isRequired,
  form: PropTypes.shape({
    setFieldTouched: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    submitForm: PropTypes.func.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    initialValue: PropTypes.string,
  }).isRequired,
  helperText: PropTypes.string,
  t: PropTypes.func.isRequired,
};

FormFieldList.defaultProps = {
  helperText: '',
};

export default withTranslation('fields')(withErrors(FormFieldList));
