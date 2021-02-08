import React, { useMemo, useCallback } from 'react';

import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useParams, useHistory } from 'react-router-dom';

import { OLD_PASSWORD_KEY, NEW_PASSWORD_KEY, PASSWORD_CONFIRM_KEY } from 'constants/account';
import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import { passwordValidationSchema } from 'constants/validationSchemas/identity';
import { forbidden, invalid } from '@misakey/ui/constants/errorTypes';

import logSentryException from '@misakey/helpers/log/sentry/exception';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import { changePassword, fetchPwdHashParams } from '@misakey/auth/builder/accounts';

import { Form } from 'formik';
import FormField from '@misakey/ui/Form/Field';
import Formik from '@misakey/ui/Formik';
import BoxControls from '@misakey/ui/Box/Controls';
import FieldPasswordRevealable from '@misakey/ui/Form/Field/Password/Revealable';
import Box from '@material-ui/core/Box';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import preparePasswordChange from '@misakey/crypto/store/actions/preparePasswordChange';
import {
  BackupDecryptionError,
  BadBackupVersion,
} from '@misakey/crypto/Errors/classes';

// CONSTANTS
const INITIAL_VALUES = {
  [OLD_PASSWORD_KEY]: '',
  [NEW_PASSWORD_KEY]: '',
  [PASSWORD_CONFIRM_KEY]: '',
};


// from https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#Preventing_autofilling_with_autocompletenew-password
const NEW_PASSWORD_INPUT_PROPS = {
  autoComplete: 'new-password',
};

// COMPONENTS
const AccountPassword = ({ t, identity }) => {
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();
  const { push } = useHistory();

  const accountHome = useGeneratePathKeepingSearchAndHash(routes.identities._, { id });

  const handleHttpErrors = useHandleHttpErrors();

  const dispatch = useDispatch();

  const { accountId } = useMemo(() => identity || {}, [identity]);

  const onSubmit = useCallback(
    async (
      { [NEW_PASSWORD_KEY]: newPassword, [OLD_PASSWORD_KEY]: oldPassword },
      { setSubmitting, setFieldError },
    ) => {
      try {
        const {
          backupData,
          backupVersion,
          commitPasswordChange,
        } = await dispatch(preparePasswordChange(newPassword, oldPassword, accountId));

        const pwdHashParams = await fetchPwdHashParams(accountId);

        await changePassword({
          accountId,
          oldPassword,
          newPassword,
          pwdHashParams,
          backupData,
          backupVersion,
        });

        await commitPasswordChange();
        enqueueSnackbar(t('account:password.success'), { variant: 'success' });
        push(accountHome);
      } catch (e) {
        if (e instanceof BackupDecryptionError || e.code === forbidden) {
          setFieldError(OLD_PASSWORD_KEY, invalid);
        } else if (e instanceof BadBackupVersion) {
          enqueueSnackbar(
            t('common:crypto.errors.shouldRefresh'),
            {
              variant: 'error',
              autoHideDuration: 8000,
            },
          );
          logSentryException(e, 'PasswordChange: Bad backup version', { crypto: true });
        } else if (e.httpStatus) {
          handleHttpErrors(e);
        } else {
          logSentryException(e, 'PasswordChange: Unidentified error', { crypto: true });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [dispatch, accountId, enqueueSnackbar, t,
      push, accountHome, handleHttpErrors],
  );

  return (
    <Formik
      validationSchema={passwordValidationSchema}
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ isSubmitting }) => (
        <Form style={{ width: '100%' }}>
          <Box mb={2}>
            <FormField
              type="password"
              name={OLD_PASSWORD_KEY}
              component={FieldPasswordRevealable}
              variant="filled"
            />
          </Box>
          <Box mb={2}>
            <FormField
              type="password"
              name={NEW_PASSWORD_KEY}
              component={FieldPasswordRevealable}
              inputProps={NEW_PASSWORD_INPUT_PROPS}
              variant="filled"
            />
          </Box>
          <FormField
            type="password"
            name={PASSWORD_CONFIRM_KEY}
            component={FieldPasswordRevealable}
            variant="filled"
          />
          <BoxControls
            mt={3}
            primary={{
              type: 'submit',
              isLoading: isSubmitting,
              'aria-label': t('common:submit'),
              text: t('common:submit'),
            }}
            formik
          />
        </Form>
      )}
    </Formik>

  );
};

AccountPassword.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountPassword.defaultProps = {
  identity: null,
};

export default withTranslation(['common', 'account'])(AccountPassword);
