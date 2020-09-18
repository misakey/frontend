import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import isEmpty from '@misakey/helpers/isEmpty';

import { useFormikContext } from 'formik';

import FormFieldTextFieldWithErrors from '@misakey/ui/Form/Field/TextFieldWithErrors';

// CONSTANTS
// see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
const ENTER_KEY = 'Enter';

// COMPONENTS
const FormFieldTextMultiline = ({ field, ...props }) => {
  const { submitForm, values, dirty, initialValues } = useFormikContext();

  const { name } = useMemo(() => field, [field]);

  const isValueEmpty = useMemo(
    () => isEmpty(values[name]),
    [values, name],
  );

  const isInitialValueEmpty = useMemo(
    () => isEmpty(initialValues[name]),
    [initialValues, name],
  );

  const canSubmit = useMemo(
    () => (isInitialValueEmpty ? dirty : !isValueEmpty),
    [isInitialValueEmpty, dirty, isValueEmpty],
  );

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
        if (canSubmit) {
          submitForm();
        }
        e.preventDefault();
      }
    },
    [canSubmit, isTouch, submitForm],
  );

  return (
    <FormFieldTextFieldWithErrors
      onTouchStart={onTouchStart}
      onKeyDown={onKeyDown}
      field={field}
      {...props}
    />
  );
};

FormFieldTextMultiline.propTypes = {
  multiline: PropTypes.bool,
  rowsMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

FormFieldTextMultiline.defaultProps = {
  multiline: true,
  rowsMax: 10,
};

export default FormFieldTextMultiline;
