import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { PREHASHED_PASSWORD } from '@misakey/react/auth/constants/account/password';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { openVaultValidationSchema } from '@misakey/react/auth/constants/validationSchemas/vault';

import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import isFunction from '@misakey/core/helpers/isFunction';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import { useSelector } from 'react-redux';
import useLoadSecretsWithPassword from '@misakey/react/crypto/hooks/useLoadSecretsWithPassword';

import { withTranslation } from 'react-i18next';
import DialogPassword from '@misakey/react/auth/components/Dialog/Password';

// CONSTANTS
const { isAuthenticated: IS_AUTH_SELECTOR } = authSelectors;

// COMPONENTS
const DialogPasswordOpenVault = ({ t, open, onClose, onSuccess, skipUpdate, ...props }) => {
  const isAuthenticated = useSelector(IS_AUTH_SELECTOR);

  const openVaultWithPassword = useLoadSecretsWithPassword(skipUpdate, isAuthenticated);

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
