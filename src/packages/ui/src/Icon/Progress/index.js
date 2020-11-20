import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

// CONSTANTS
const DEFAULT_SIZE = 36;
const SIZES = {
  small: 32,
  default: DEFAULT_SIZE,
  large: 47,
};

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
const IconProgress = ({ isLoading, done, Icon, DoneIcon, fontSize, color, ...props }) => {
  const classes = useStyles();

  const size = useMemo(
    () => SIZES[fontSize],
    [fontSize],
  );

  return (
    <Box position="relative">
      {done ? (
        <DoneIcon
          fontSize={fontSize}
          color={color}
          {...props}
        />
      ) : (
        <Icon
          fontSize={fontSize}
          color={color}
          {...props}
        />
      )}
      {isLoading && !done && (
      <CircularProgress
        color={color}
        size={size}
        className={classes.progress}
      />
      )}
    </Box>
  );
};

IconProgress.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  done: PropTypes.bool.isRequired,
  fontSize: PropTypes.string,
  color: PropTypes.string,
  Icon: PropTypes.elementType.isRequired,
  DoneIcon: PropTypes.elementType.isRequired,
};

IconProgress.defaultProps = {
  fontSize: 'default',
  color: undefined,
};

export default IconProgress;
