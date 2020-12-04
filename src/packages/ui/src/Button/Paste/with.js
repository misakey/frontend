import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';

import mergeDeepLeft from '@misakey/helpers/mergeDeepLeft';

import ButtonPaste from '@misakey/ui/Button/Paste';
import InputAdornment from '@material-ui/core/InputAdornment';

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
  const ComponentWithPaste = ({
    field, buttonProps, InputProps,
    startAdornment, endAdornment,
    ...props
  }) => {
    const inputRef = useRef();

    // expected: we don't need both start and end adornment
    const adornmentInputProps = useMemo(
      () => {
        if (startAdornment) {
          return mergeDeepLeft({
            startAdornment: (
              <InputAdornment position="start">
                <ButtonPaste inputRef={inputRef} field={field} {...buttonProps} />
              </InputAdornment>
            ),
          }, InputProps);
        }
        if (endAdornment) {
          return mergeDeepLeft({
            endAdornment: (
              <InputAdornment position="end">
                <ButtonPaste inputRef={inputRef} field={field} {...buttonProps} />
              </InputAdornment>
            ),
          }, InputProps);
        }
        return null;
      },
      [startAdornment, endAdornment, inputRef, field, buttonProps, InputProps],
    );

    if (startAdornment || endAdornment) {
      return (
        <Component
          inputRef={inputRef}
          inputProps={INPUT_PROPS}
          field={field}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          InputProps={adornmentInputProps}
          {...props}
        />
      );
    }

    return (
      <>
        <Component
          inputRef={inputRef}
          inputProps={INPUT_PROPS}
          field={field}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          InputProps={InputProps}
          {...props}
        />
        <ButtonPaste inputRef={inputRef} field={field} {...buttonProps} />
      </>
    );
  };

  ComponentWithPaste.propTypes = {
    field: PropTypes.object.isRequired,
    buttonProps: PropTypes.object,
    startAdornment: PropTypes.bool,
    endAdornment: PropTypes.bool,
    InputProps: PropTypes.object,
  };

  ComponentWithPaste.defaultProps = {
    buttonProps: {},
    startAdornment: false,
    endAdornment: false,
    InputProps: {},
  };

  return ComponentWithPaste;
};

export default withPaste;
