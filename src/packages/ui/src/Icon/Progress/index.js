import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { CIRCULAR_PROGRESS_SIZES } from '@misakey/ui/constants/sizes';

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
const IconProgress = forwardRef(({
  isLoading, done, fontSize, color,
  Icon, DoneIcon,
  progressProps,
  ...props
}, ref) => {
  const classes = useStyles();

  const size = useMemo(
    () => CIRCULAR_PROGRESS_SIZES[fontSize],
    [fontSize],
  );

  return (
    <Box position="relative">
      {done ? (
        <DoneIcon
          ref={ref}
          fontSize={fontSize}
          color={color}
          {...props}
        />
      ) : (
        <Icon
          ref={ref}
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
        {...progressProps}
      />
      )}
    </Box>
  );
});

IconProgress.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  done: PropTypes.bool.isRequired,
  fontSize: PropTypes.string,
  color: PropTypes.string,
  Icon: PropTypes.elementType.isRequired,
  DoneIcon: PropTypes.elementType.isRequired,
  progressProps: PropTypes.object,
};

IconProgress.defaultProps = {
  fontSize: 'default',
  color: undefined,
  progressProps: {},
};

export default IconProgress;
