import React, { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { generatePath, useParams, useHistory } from 'react-router-dom';

import { OLD_PASSWORD_KEY, NEW_PASSWORD_KEY, PASSWORD_CONFIRM_KEY } from 'constants/account';
import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import { passwordValidationSchema } from 'constants/validationSchemas/identity';
import errorTypes from '@misakey/ui/constants/errorTypes';

import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useCreateNewBackupShares from '@misakey/crypto/hooks/useCreateNewBackupShares';

import { changePassword, fetchPwdHashParams } from '@misakey/auth/builder/accounts';

import { Form } from 'formik';
import FormField from '@misakey/ui/Form/Field';
import Formik from '@misakey/ui/Formik';
import ScreenAction from 'components/dumb/Screen/Action';
import BoxControls from '@misakey/ui/Box/Controls';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

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
const AccountPassword = ({ t, identity, isFetching }) => {
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();
  const { push } = useHistory();

  const state = useMemo(
    () => ({ isLoading: isFetching || isNil(identity) }),
    [identity, isFetching],
  );

  const accountHome = useMemo(
    () => generatePath(routes.accounts._, { id }),
    [id],
  );

  const navigationProps = useMemo(
    () => ({
      homePath: accountHome,
    }),
    [accountHome],
  );

  const handleHttpErrors = useHandleHttpErrors();

  const dispatch = useDispatch();

  const { accountId } = useMemo(() => identity || {}, [identity]);
  const createNewBackupKeyShares = useCreateNewBackupShares(dispatch);

  const onSubmit = useCallback(
    async (
      { [NEW_PASSWORD_KEY]: newPassword, [OLD_PASSWORD_KEY]: oldPassword },
      { setSubmitting, setFieldError },
    ) => {
      try {
        const {
          backupData,
          backupVersion,
          backupKey,
          commitPasswordChange,
        } = await dispatch(preparePasswordChange(newPassword, oldPassword));

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
        createNewBackupKeyShares(backupKey, accountId).finally(() => {
          enqueueSnackbar(t('account:password.success'), { variant: 'success' });
          push(accountHome);
        });
      } catch (e) {
        if (e instanceof BackupDecryptionError || e.code === errorTypes.forbidden) {
          setFieldError(OLD_PASSWORD_KEY, errorTypes.invalid);
        } else if (e instanceof BadBackupVersion) {
          enqueueSnackbar(
            t('common:crypto.errors.shouldRefresh'),
            {
              variant: 'error',
              autoHideDuration: 8000,
            },
          );
          log(e, 'error');
        } else if (e.httpStatus) {
          handleHttpErrors(e);
        } else {
          log(e, 'error');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [dispatch, accountId, enqueueSnackbar, t, createNewBackupKeyShares,
      push, accountHome, handleHttpErrors],
  );

  return (
    <ScreenAction
      title={t('account:password.title')}
      state={state}
      navigationProps={navigationProps}
    >
      <Container maxWidth="md">
        <Formik
          validationSchema={passwordValidationSchema}
          onSubmit={onSubmit}
          initialValues={INITIAL_VALUES}
        >
          {({ isSubmitting }) => (
            <Form>
              <Box mb={2}>
                <FormField
                  type="password"
                  name={OLD_PASSWORD_KEY}
                  component={FieldTextPasswordRevealable}
                />
              </Box>
              <Box mb={2}>
                <FormField
                  type="password"
                  name={NEW_PASSWORD_KEY}
                  component={FieldTextPasswordRevealable}
                  inputProps={NEW_PASSWORD_INPUT_PROPS}
                />
              </Box>
              <FormField
                type="password"
                name={PASSWORD_CONFIRM_KEY}
                component={FieldTextPasswordRevealable}
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
      </Container>
    </ScreenAction>
  );
};

AccountPassword.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountPassword.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation(['common', 'account'])(AccountPassword);
