import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import IconButton from '@misakey/ui/IconButton';

// COMPONENTS
const IconButtonAppBar = forwardRef(({ children, ...props }, ref) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <IconButton
      ref={ref}
      // prevent appBar to grow too much on mobile view
      size={isSmall ? 'small' : 'medium'}
      {...props}
    >
      {children}
    </IconButton>
  );
});

IconButtonAppBar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default IconButtonAppBar;
