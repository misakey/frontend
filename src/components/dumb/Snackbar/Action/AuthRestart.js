import React, { useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { useSnackbar } from 'notistack';
import useLoginChallenge from 'hooks/useLoginChallenge';
import useResetAuthHref from '@misakey/auth/hooks/useResetAuthHref';

import Button from '@material-ui/core/Button';

// COMPONENTS
const SnackbarActionAuthRestart = forwardRef(({
  id,
  t,
}, ref) => {
  const { closeSnackbar } = useSnackbar();

  const loginChallenge = useLoginChallenge();

  const resetAuthHref = useResetAuthHref(loginChallenge);

  const onClose = useCallback(
    () => closeSnackbar(id),
    [closeSnackbar, id],
  );

  return (
    <Button
      ref={ref}
      variant="text"
      color="inherit"
      href={resetAuthHref}
      onClick={onClose}
    >
      {t('common:retry')}
    </Button>
  );
});

SnackbarActionAuthRestart.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('common', { withRef: true })(SnackbarActionAuthRestart);
