
import React from 'react';
import PropTypes from 'prop-types';

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import MuiCloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

const DialogTitle = ({ children, classes, onClose, closeIcon: CloseIcon, ...other }) => (
  <MuiDialogTitle disableTypography className={classes.root} {...other}>
    {onClose ? (
      <IconButton aria-label="close" className={classes.button} onClick={onClose}>
        <CloseIcon />
      </IconButton>
    ) : null}
    {children && (
      <Typography variant="h6">{children}</Typography>
    )}
  </MuiDialogTitle>
);

DialogTitle.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  closeIcon: PropTypes.object,
};

DialogTitle.defaultProps = {
  children: null,
  closeIcon: MuiCloseIcon,
};

export default withStyles(styles)(DialogTitle);
