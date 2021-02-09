import React from 'react';

import PropTypes from 'prop-types';

import { SnackbarProvider as NotistackSnackbarProvider } from 'notistack';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SnackbarActionHide from '@misakey/ui/Snackbar/Action/Hide';

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    whiteSpace: 'pre-wrap',
  },
}));

const SnackbarProvider = ({ children }) => {
  const classes = useStyles();

  return (
    <NotistackSnackbarProvider
      action={(key) => <SnackbarActionHide id={key} />}
      maxSnack={60}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      classes={{ root: classes.root }}
    >
      {children}
    </NotistackSnackbarProvider>
  );
};

SnackbarProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
};

SnackbarProvider.defaultProps = {
  children: null,
};

export default SnackbarProvider;
