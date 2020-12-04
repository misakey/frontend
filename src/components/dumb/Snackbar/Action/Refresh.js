import { useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';

import { useSnackbar } from 'notistack';

import IconButton from '@material-ui/core/IconButton';

import RefreshIcon from '@material-ui/icons/Refresh';

// COMPONENTS
const SnackbarActionRefresh = forwardRef(({ id }, ref) => {
  const { closeSnackbar } = useSnackbar();

  const onClose = useCallback(
    () => {
      closeSnackbar(id);
      window.location.reload();
    },
    [closeSnackbar, id],
  );

  return (
    <IconButton
      size="small"
      color="inherit"
      ref={ref}
      onClick={onClose}
    >
      <RefreshIcon fontSize="small" />
    </IconButton>
  );
});

SnackbarActionRefresh.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default SnackbarActionRefresh;
