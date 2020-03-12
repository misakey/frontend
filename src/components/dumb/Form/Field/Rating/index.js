import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Rating from '@material-ui/lab/Rating';
import omit from '@misakey/helpers/omit';
import withErrors from 'components/dumb/Form/Field/withErrors';

const RatingField = ({
  displayError, errorKeys, field, form, helperText, t, ...rest
}) => {
  const onChange = useCallback(
    (event, value) => {
      form.setFieldValue(field.name, value);
    },
    [field, form],
  );
  const onChangeActive = useCallback(
    (event, value) => {
      if (value === -1) {
        form.setFieldTouched(field.name, true);
      }
    },
    [field, form],
  );
  return (
    <FormControl error={displayError}>
      <Rating
        {...field}
        onChange={onChange}
        onChangeActive={onChangeActive}
        {...omit(rest, ['i18n', 'tReady', 'form'])}
      />
      {(displayError || helperText) && (
        <FormHelperText>{displayError ? t(errorKeys) : helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

RatingField.propTypes = {
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

RatingField.defaultProps = {
  className: '',
  helperText: '',
};

export default withTranslation('fields')(withErrors(RatingField));
