import React, { useCallback } from 'react';
import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';
import { openVaultValidationSchema } from 'constants/validationSchemas/auth';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import useLoadSecretsWithPassword from '@misakey/crypto/hooks/useLoadSecretsWithPassword';
import DialogPassword from 'components/smart/Dialog/Password';

// COMPONENTS
const DialogPasswordOpenVault = ({ t, open, onClose, ...props }) => {
  const openVaultWithPassword = useLoadSecretsWithPassword();

  const onSubmit = useCallback(
    ({ [PREHASHED_PASSWORD]: password }) => openVaultWithPassword(password)
      .then(() => { onClose(); }),
    [openVaultWithPassword, onClose],
  );

  return (
    <DialogPassword
      contentText={t('boxes:vault.dialog.text')}
      submitText={t('common:unlock')}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      formikProps={{ validationSchema: openVaultValidationSchema }}
      {...omitTranslationProps(props)}
    />
  );
};


DialogPasswordOpenVault.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogPasswordOpenVault.defaultProps = {
  open: false,
  onClose: null,
};

export default withTranslation(['boxes', 'common'])(DialogPasswordOpenVault);
