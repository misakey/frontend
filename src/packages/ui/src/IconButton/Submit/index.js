import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { useFormikContext } from 'formik';

import IconButton from '@material-ui/core/IconButton';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

// NB: this component expects to be wrapped in a formik context
const IconButtonSubmit = forwardRef(({ children, isLoading, ...rest }, ref) => {
  const { isSubmitting } = useFormikContext();

  return (
    <IconButton
      ref={ref}
      type="submit"
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
};

IconButtonSubmit.defaultProps = {
  children: null,
  isLoading: false,
};

export default IconButtonSubmit;
