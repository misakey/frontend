import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles(() => ({
  buttonLabel: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

// COMPONENTS
const ButtonShortcut = forwardRef(({ children, label, disableTypography, ...rest }, ref) => {
  const classes = useStyles();

  return (
    <Button
      ref={ref}
      variant="text"
      classes={{ label: classes.buttonLabel }}
      aria-label={label}
      {...rest}
    >
      {children}
      {disableTypography ? label : (
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
      )}
    </Button>
  );
});

ButtonShortcut.propTypes = {
  children: PropTypes.node,
  label: PropTypes.node,
  disableTypography: PropTypes.bool,
};

ButtonShortcut.defaultProps = {
  children: null,
  label: null,
  disableTypography: false,
};

export default ButtonShortcut;
