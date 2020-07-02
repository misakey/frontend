import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import FieldText from 'components/dumb/Form/Field/Text';

import { useFormikContext } from 'formik';

// CONSTANTS
// see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
const ENTER_KEY = 'Enter';

// COMPONENTS
const FormFieldTextMultiline = (props) => {
  const { submitForm, dirty } = useFormikContext();

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === ENTER_KEY) {
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
          return;
        }
        if (dirty) {
          submitForm();
        }
        e.preventDefault();
      }
    },
    [dirty, submitForm],
  );

  return (
    <FieldText onKeyDown={onKeyDown} {...props} />
  );
};

FormFieldTextMultiline.propTypes = {
  multiline: PropTypes.bool,
  rowsMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

FormFieldTextMultiline.defaultProps = {
  multiline: true,
  rowsMax: 10,
};

export default FormFieldTextMultiline;
