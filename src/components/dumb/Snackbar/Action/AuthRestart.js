import React, { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import { useSnackbar } from 'notistack';

import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

// COMPONENTS
const SnackbarActionAuthRestart = forwardRef(({
  id,
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
      // @FIXME use data from backend to have better redirection
      to={routes.auth.redirectToSignIn}
      variant="text"
      color="inherit"
      onClick={onClose}
    >
      {t('common:retry')}
    </Button>
  );
});

SnackbarActionAuthRestart.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common', { withRef: true })(SnackbarActionAuthRestart);
