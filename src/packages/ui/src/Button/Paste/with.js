import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import ButtonPaste from '@misakey/ui/Button/Paste';

// CONSTANTS
export const MODE = {
  icon: 'icon',
  text: 'text',
};
export const MODES = Object.values(MODE);

const INPUT_PROPS = { contentEditable: true };

// COMPONENTS
// expects to be child of a Formik Form
const withPaste = (Component) => {
  const ComponentWithPaste = ({ field, buttonProps, ...props }) => {
    const inputRef = useRef();
    return (
      <>
        <Component
          inputRef={inputRef}
          inputProps={INPUT_PROPS}
          field={field}
          {...props}
        />
        <ButtonPaste inputRef={inputRef} field={field} {...buttonProps} />
      </>
    );
  };

  ComponentWithPaste.propTypes = {
    field: PropTypes.object.isRequired,
    buttonProps: PropTypes.object,
  };

  ComponentWithPaste.defaultProps = {
    buttonProps: {},
  };

  return ComponentWithPaste;
};

export default withPaste;
