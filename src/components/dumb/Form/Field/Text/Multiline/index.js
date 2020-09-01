import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import FormFieldTextFieldWithErrors from '@misakey/ui/Form/Field/TextFieldWithErrors';

import { useFormikContext } from 'formik';

// CONSTANTS
// see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
const ENTER_KEY = 'Enter';

// COMPONENTS
const FormFieldTextMultiline = (props) => {
  const { submitForm, dirty } = useFormikContext();

  const [isTouch, setIsTouch] = useState(false);

  const onTouchStart = useCallback(
    () => {
      setIsTouch(true);
    },
    [setIsTouch],
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === ENTER_KEY) {
        // do not submit when alt, meta, shift, or touch was used, except for ctrl + Enter
        // touch device : ctrl + enter can submit
        // non-touch device : enter, ctrl + enter can submit
        // @FIXME a device with a mouse and a virtual keyboard wll have issues adding line jumps
        if (e.altKey || e.metaKey || e.shiftKey || (isTouch && !e.ctrlKey)) {
          return;
        }
        if (dirty) {
          submitForm();
        }
        e.preventDefault();
      }
    },
    [dirty, isTouch, submitForm],
  );

  return (
    <FormFieldTextFieldWithErrors onTouchStart={onTouchStart} onKeyDown={onKeyDown} {...props} />
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
