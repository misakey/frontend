import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { CirclePicker } from 'react-color';
import ACCOUNT_COLORS from 'constants/account/colors';



const CirclePickerField = ({
  field: { value, name }, form: { setFieldValue, setFieldTouched },
}) => {
  const onChange = useCallback(
    (color) => {
      setFieldValue(name, color.hex);
      setFieldTouched(name, true, false);
    },
    [name, setFieldTouched, setFieldValue],
  );

  return <CirclePicker onChange={onChange} color={value} colors={ACCOUNT_COLORS} />;
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
};

export default CirclePickerField;
