import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import PropTypes from 'prop-types';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import isNil from '@misakey/core/helpers/isNil';

import Dialog from '@material-ui/core/Dialog';
import RegisterTotpDialogContent from '@misakey/react-auth/components/screens/Identity/Account/Security/MFA/TOTP/Dialog/Register';
import RecoveryTotpDialogContent from '@misakey/react-auth/components/screens/Identity/Account/Security/MFA/TOTP/Dialog/Recovery';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

function RegisterTotpDialog({
  onClose, open, identityId, onSuccess, recoveryCodes, onSetRecoveryCodes, ...props
}) {
  const { t } = useTranslation('account');

  const fullScreen = useDialogFullScreen();

  const onRecoveryClose = useCallback(
    () => {
      onSuccess();
      onClose();
      onSetRecoveryCodes(null);
    },
    [onClose, onSetRecoveryCodes, onSuccess],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-label={t('account:security.MFA.totp.dialog.title.register')}
      {...omitTranslationProps(props)}
    >
      {isNil(recoveryCodes)
        ? (
          <RegisterTotpDialogContent
            onSetRecoveryCodes={onSetRecoveryCodes}
            identityId={identityId}
            onClose={onClose}
          />
        )
        : (
          <RecoveryTotpDialogContent
            recoveryCodes={recoveryCodes}
            onClose={onRecoveryClose}
          />
        )}

    </Dialog>
  );
}

RegisterTotpDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSetRecoveryCodes: PropTypes.func.isRequired,
  recoveryCodes: PropTypes.arrayOf(PropTypes.string),
  onSuccess: PropTypes.func.isRequired,
  identityId: PropTypes.string.isRequired,
};

RegisterTotpDialog.defaultProps = {
  open: false,
  recoveryCodes: null,
};

export default RegisterTotpDialog;
