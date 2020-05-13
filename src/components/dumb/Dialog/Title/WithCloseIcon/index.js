
import React from 'react';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
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

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
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
});

export default DialogTitle;
