import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

// HOOKS
const useStyles = makeStyles(() => ({
  progress: {
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
}));

// COMPONENTS
const IconProgress = ({ isLoading, done, Icon, DoneIcon }) => {
  const classes = useStyles();

  return (
    <Box position="relative">
      {done ? <DoneIcon /> : <Icon />}
      {isLoading && !done && <CircularProgress size={36} className={classes.progress} />}
    </Box>
  );
};

IconProgress.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  done: PropTypes.bool.isRequired,
  Icon: PropTypes.elementType.isRequired,
  DoneIcon: PropTypes.elementType.isRequired,
};

export default IconProgress;
