import React from 'react';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

// HELPERS
const makeStyles = () => ({
  wrapper: {
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

// COMPONENTS
// @FIXME add to misakey/ui
const ButtonProgress = ({ classes, isProgressing, children, progressProps, ...rest }) => (
  <span className={classes.wrapper}>
    <Button
      type="submit"
      variant="contained"
      color="secondary"
      disabled={isProgressing}
      {...rest}
    >
      {children}
    </Button>
    {isProgressing && (
      <CircularProgress size={24} className={classes.buttonProgress} {...progressProps} />
    )}
  </span>
);

ButtonProgress.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string),
  isProgressing: PropTypes.bool,
  progressProps: PropTypes.object,
  children: PropTypes.string,
};

ButtonProgress.defaultProps = {
  classes: {},
  isProgressing: false,
  progressProps: {},
  children: null,
};

export default withStyles(makeStyles)(ButtonProgress);
