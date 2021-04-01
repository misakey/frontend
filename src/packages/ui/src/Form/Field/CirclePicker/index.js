import React, { useCallback } from 'react';

import PropTypes from 'prop-types';

import ACCOUNT_COLORS from '@misakey/react/auth/constants/account/colors';

import isFunction from '@misakey/core/helpers/isFunction';

import { CirclePicker } from 'react-color';

// COMPONENTS
const CirclePickerField = ({
  field: { value, name }, form: { setFieldValue, setFieldTouched },
  onChange,
}) => {
  const handleChange = useCallback(
    (color) => {
      const nextValue = color.hex;
      setFieldValue(name, nextValue);
      setFieldTouched(name, true, false);
      if (isFunction(onChange)) {
        onChange(nextValue);
      }
    },
    [name, onChange, setFieldTouched, setFieldValue],
  );

  return <CirclePicker onChange={handleChange} color={value} colors={ACCOUNT_COLORS} />;
};


CirclePickerField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
  }).isRequired,
  form: PropTypes.shape({
    setFieldTouched: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  onChange: PropTypes.func,
};

CirclePickerField.defaultProps = {
  onChange: null,
};

export default CirclePickerField;
