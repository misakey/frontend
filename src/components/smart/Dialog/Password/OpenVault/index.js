import React, { useCallback } from 'react';

import logSentryException from '@misakey/helpers/log/sentry/exception';

import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';
import { openVaultValidationSchema } from 'constants/validationSchemas/vault';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import useLoadSecretsWithPassword from '@misakey/crypto/hooks/useLoadSecretsWithPassword';
import DialogPassword from 'components/smart/Dialog/Password';
import isFunction from '@misakey/helpers/isFunction';

// COMPONENTS
const DialogPasswordOpenVault = ({ t, open, onClose, onSuccess, skipUpdate, ...props }) => {
  const openVaultWithPassword = useLoadSecretsWithPassword(skipUpdate);

  const onSubmit = useCallback(
    async ({ [PREHASHED_PASSWORD]: password }) => {
      try {
        await openVaultWithPassword(password);
        onClose();
        if (isFunction(onSuccess)) {
          onSuccess();
        }
      } catch (error) {
        logSentryException(error, 'Opening vault with password', { crypto: true });
        throw error;
      }
    },
    [openVaultWithPassword, onClose, onSuccess],
  );

  return (
    <DialogPassword
      contentText={t('common:askOpenVault')}
      submitText={t('common:continue')}
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
  onSuccess: PropTypes.func,
  skipUpdate: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogPasswordOpenVault.defaultProps = {
  open: false,
  onClose: null,
  onSuccess: null,
  skipUpdate: false,
};

export default withTranslation('common')(DialogPasswordOpenVault);
