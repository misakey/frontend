import React, { useMemo, useCallback } from 'react';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useParams, useHistory } from 'react-router-dom';

import { OLD_PASSWORD_KEY, NEW_PASSWORD_KEY, PASSWORD_CONFIRM_KEY } from 'constants/account';
import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import { passwordValidationSchema } from 'constants/validationSchemas/identity';
import { invalid, forbidden } from '@misakey/ui/constants/errorTypes';
import { getCode } from '@misakey/helpers/apiError';

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

import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import { encryptRootKeyWithNewPassword } from '@misakey/crypto';

const {
  getRootKey,
} = cryptoSelectors;

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

  const { accountId } = useMemo(() => identity || {}, [identity]);

  const rootKey = useSelector(getRootKey);

  const onSubmit = useCallback(
    async (
      { [NEW_PASSWORD_KEY]: newPassword, [OLD_PASSWORD_KEY]: oldPassword },
      { setSubmitting, setFieldError },
    ) => {
      try {
        const encryptedAccountRootKey = await encryptRootKeyWithNewPassword(rootKey, newPassword);
        const pwdHashParams = await fetchPwdHashParams(accountId);

        await changePassword({
          accountId,
          oldPassword,
          newPassword,
          pwdHashParams,
          encryptedAccountRootKey,
        });

        enqueueSnackbar(t('account:forgotPassword.success'), { variant: 'success' });
        push(accountHome);
      } catch (e) {
        if (e.httpStatus || getCode(e) === forbidden) {
          setFieldError(OLD_PASSWORD_KEY, invalid);
          return;
        }
        handleHttpErrors(e);
        logSentryException(e, 'PasswordChange: Unidentified error', { crypto: true });
      } finally {
        setSubmitting(false);
      }
    },
    [accountId, enqueueSnackbar, t, rootKey,
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
