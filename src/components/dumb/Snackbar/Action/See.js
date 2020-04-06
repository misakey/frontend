import React, { useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useSnackbar } from 'notistack';

import Button from '@material-ui/core/Button';

// COMPONENTS
const SnackbarActionSee = forwardRef(({
  id,
  to,
  t,
}, ref) => {
  const { closeSnackbar } = useSnackbar();

  const onClose = useCallback(
    () => closeSnackbar(id),
    [closeSnackbar, id],
  );

  return (
    <Button
      ref={ref}
      component={Link}
      to={to}
      variant="text"
      color="inherit"
      onClick={onClose}
    >
      {t('common:see')}
    </Button>
  );
});

SnackbarActionSee.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  t: PropTypes.func.isRequired,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default withTranslation('common', { withRef: true })(SnackbarActionSee);
