import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useFormikContext } from 'formik';

import IconButton from '@material-ui/core/IconButton';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

// NB: this component expects to be wrapped in a formik context
const IconButtonSubmit = forwardRef(({ children, isLoading, disabled, ...rest }, ref) => {
  const { isSubmitting } = useFormikContext();

  const disabledOrLoading = useMemo(
    () => disabled || isLoading || isSubmitting,
    [disabled, isLoading, isSubmitting],
  );

  return (
    <IconButton
      ref={ref}
      type="submit"
      disabled={disabledOrLoading}
      {...rest}
    >
      {(isSubmitting || isLoading) ? (
        <HourglassEmptyIcon />
      ) : children}
    </IconButton>
  );
});

IconButtonSubmit.propTypes = {
  children: PropTypes.node,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};

IconButtonSubmit.defaultProps = {
  children: null,
  isLoading: false,
  disabled: false,
};

export default IconButtonSubmit;
