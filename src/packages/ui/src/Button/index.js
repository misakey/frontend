import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
import MUIButton from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

export const BUTTON_STANDINGS = {
  MAIN: 'main',
  OUTLINED: 'outlined',
  TEXT: 'text',
  CANCEL: 'cancel',
};

const BUTTON_PROPS_BY_STANDING = {
  [BUTTON_STANDINGS.MAIN]: {
    variant: 'contained',
    color: 'secondary',
  },
  [BUTTON_STANDINGS.OUTLINED]: {
    variant: 'outlined',
    color: 'secondary',
  },
  [BUTTON_STANDINGS.TEXT]: {
    variant: 'text',
    color: 'secondary',
  },
  [BUTTON_STANDINGS.CANCEL]: {
    variant: 'text',
    color: 'default',
  },
};

// HELPERS
const makeStyles = () => ({
  wrapper: {
    position: 'relative',
  },
  buttonRoot: {
    width: '100%',
  },
  buttonLabel: ({ isLoading }) => ({
    color: isLoading ? 'transparent' : null,
    whiteSpace: 'nowrap',
  }),
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

const getDefaultProps = (standing) => {
  const props = BUTTON_PROPS_BY_STANDING[standing];
  return props || {};
};

// COMPONENTS
const Button = forwardRef(({
  classes,
  isLoading,
  disabled,
  text,
  progressProps,
  standing,
  ...rest
}, ref) => {
  const disabledOrLoading = useMemo(() => disabled || isLoading, [disabled, isLoading]);

  return (
    <span className={classes.wrapper}>
      <MUIButton
        ref={ref}
        classes={{ root: classes.buttonRoot, label: classes.buttonLabel }}
        {...getDefaultProps(standing)}
        disabled={disabledOrLoading}
        {...rest}
      >
        {text}
      </MUIButton>
      {isLoading && (
        <CircularProgress size={24} className={classes.buttonProgress} {...progressProps} />
      )}
    </span>
  );
});

Button.propTypes = {
  classes: PropTypes.shape({
    wrapper: PropTypes.string,
    buttonRoot: PropTypes.string,
    buttonLabel: PropTypes.string,
    buttonProgress: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  progressProps: PropTypes.object,
  standing: PropTypes.oneOf(Object.values(BUTTON_STANDINGS)),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

Button.defaultProps = {
  classes: {
    wrapper: '',
    buttonRoot: '',
    buttonLabel: '',
    buttonProgress: '',
  },
  isLoading: false,
  disabled: false,
  progressProps: {},
  standing: BUTTON_STANDINGS.CANCEL,
};

export default withStyles(makeStyles)(Button);
