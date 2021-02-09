import React, { useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { useSnackbar } from 'notistack';

import Button from '@material-ui/core/Button';

// COMPONENTS
const SnackbarActionRetry = forwardRef(({
  id,
  fn,
  onClick,
  t,
}, ref) => {
  const { closeSnackbar } = useSnackbar();

  const onClose = useCallback(
    () => {
      onClick(fn);
      closeSnackbar(id);
    },
    [closeSnackbar, fn, id, onClick],
  );

  return (
    <Button
      ref={ref}
      variant="text"
      color="inherit"
      onClick={onClose}
    >
      {t('common:retry')}
    </Button>
  );
});

SnackbarActionRetry.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  fn: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common', { withRef: true })(SnackbarActionRetry);
