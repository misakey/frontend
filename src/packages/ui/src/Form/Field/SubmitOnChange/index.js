import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';

import { useFormikContext } from 'formik';
import { useMemo, useCallback } from 'react';

import Field from '@misakey/ui/Form/Field';

// COMPONENTS
const FieldSubmitOnChange = ({ name, onChange, ...rest }) => {
  const { submitForm, values, handleChange } = useFormikContext();

  const value = useMemo(
    () => values[name],
    [values, name],
  );

  const handleChangeSubmit = useCallback(
    (e) => {
      if (isFunction(onChange)) {
        onChange(e);
      } else {
        handleChange(e);
      }
      setTimeout(() => submitForm());
    },
    [onChange, submitForm, handleChange],
  );

  return (
    <Field
      name={name}
      value={value}
      onChange={handleChangeSubmit}
      {...rest}
    />
  );
};

FieldSubmitOnChange.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

FieldSubmitOnChange.defaultProps = {
  onChange: null,
};

export default FieldSubmitOnChange;
