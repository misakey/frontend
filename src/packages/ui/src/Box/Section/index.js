import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey.A100}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
}));

// COMPONENTS
const BoxSection = forwardRef(({ children, className, ...rest }, ref) => {
  const classes = useStyles();

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
};

BoxSection.defaultProps = {
  children: null,
  className: '',
};

export default BoxSection;
