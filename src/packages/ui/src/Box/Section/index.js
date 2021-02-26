import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: ({ border, square }) => ({
    border: border ? `1px solid ${theme.palette.grey.A100}` : null,
    borderRadius: square ? null : theme.shape.borderRadius,
    overflow: 'hidden',
  }),
}));

// COMPONENTS
const BoxSection = forwardRef(({ children, className, border, square, ...rest }, ref) => {
  const classes = useStyles({ border, square });

  return (
    <Box
      ref={ref}
      component="section"
      p={3}
      className={clsx(classes.root, className)}
      {...rest}
    >
      {children}
    </Box>
  );
});

BoxSection.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  border: PropTypes.bool,
  square: PropTypes.bool,
};

BoxSection.defaultProps = {
  children: null,
  className: '',
  border: true,
  square: false,
};

export default BoxSection;
