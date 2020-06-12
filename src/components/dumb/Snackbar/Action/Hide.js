import React, { useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import CloseIcon from '@material-ui/icons/Close';

import { useSnackbar } from 'notistack';

import IconButton from '@material-ui/core/IconButton';

// COMPONENTS
const SnackbarActionHide = forwardRef(({ id }, ref) => {
  const { closeSnackbar } = useSnackbar();

  const onClose = useCallback(
    () => closeSnackbar(id),
    [closeSnackbar, id],
  );

  return (
    <IconButton
      size="small"
      color="inherit"
      ref={ref}
      onClick={onClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );
});

SnackbarActionHide.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default SnackbarActionHide;
