import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles((theme) => ({
  stack: ({ color }) => ({
    position: 'absolute',
    color: theme.palette.text[color],
  }),
  background: {
    opacity: '0.6',
  },
  foreground: {
    opacity: '0.6',
  },
}));

// COMPONENTS
const IconStack = ({ ForegroundIcon, BackgroundIcon, color, ...props }) => {
  const classes = useStyles({ color });

  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
      className={classes.boxPosition}
    >
      <BackgroundIcon fontSize="large" className={clsx(classes.background, classes.stack)} {...props} />
      <ForegroundIcon className={clsx(classes.stack, classes.foreground)} {...props} />
    </Box>
  );
};

IconStack.propTypes = {
  ForegroundIcon: PropTypes.elementType.isRequired,
  BackgroundIcon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
};

IconStack.defaultProps = {
  color: 'primary',
};

export default IconStack;
