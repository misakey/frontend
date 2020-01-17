import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { passwordValidationSchema } from 'constants/validationSchemas/profile';
import errorTypes from 'constants/errorTypes';

import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import ScreenAction from 'components/dumb/Screen/Action';
import BoxControls from 'components/dumb/Box/Controls';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import { ownerCryptoContext as cryptoContext } from '@misakey/crypto';
import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

// CONSTANTS
const INITIAL_VALUES = {
  passwordOld: '',
  passwordNew: '',
  passwordConfirm: '',
};

const OLD_PASSWORD_FIELD_NAME = 'passwordOld';

// HELPERS
async function updatePassword(
  id,
  { passwordOld, passwordNew, passwordConfirm },
  enqueueSnackbar,
  t,
) {
  let backupData;
  let backupDecryptionError;
  try {
    ({ backupData } = await cryptoContext.preparePasswordChange(passwordNew, passwordOld, id));
    backupDecryptionError = null;
  } catch (e) {
    if (e instanceof BackupDecryptionError || e instanceof TypeError) {
      backupDecryptionError = e;
    } else {
      throw e;
    }
  }

  let response;
  try {
    if (!isNil(backupDecryptionError)) {
      backupDecryptionError.code = errorTypes.forbidden;
      throw backupDecryptionError;
    }
    response = await API.use(API.endpoints.user.password.update)
      .build({}, objectToSnakeCase({
        userId: id,
        oldPassword: passwordOld,
        newPassword: passwordNew,
        confirm: passwordConfirm,
        backupData,
      }))
      .send();
    return response;
  } catch (e) {
    if (e.error_code === 'invalid_password' && isNil(backupDecryptionError)) {
      log('server indicated a bad password but backup decryption seems to have succeeded', 'error');
      enqueueSnackbar(t('screens:account.password.backupDecryptionError'), { variant: 'error' });
    }
    // note that we do *not* display an "backupDecryptionError" error in the UI
    // if the the backup did failed to decrypt
    // but the HTTP error is something else than "invalid password".
    // We don't want to scare the user without a reason.
    throw e;
  }
}

// HOOKS
const useOnSubmit = (
  profile, enqueueSnackbar, setInternalError, history, t,
) => useMemo(
  () => (form, { setSubmitting, setFieldError }) => (
    updatePassword(profile.id, form, enqueueSnackbar, t)
      .then(() => {
        cryptoContext.commitPasswordChange();
        enqueueSnackbar(t('screens:account.password.success'), { variant: 'success' });
        history.push(routes.account._);
      })
      .catch((error) => {
        if (error.code === errorTypes.forbidden) {
          setFieldError(OLD_PASSWORD_FIELD_NAME, errorTypes.invalid);
        } else {
          const { httpStatus } = error;
          setInternalError({ httpStatus });
        }
      })
      .finally(() => { setSubmitting(false); })
  ),
  [profile, enqueueSnackbar, setInternalError, history, t],
);

// COMPONENTS
const AccountPassword = ({
  t,
  profile,
  history,
  error,
  isFetching,
}) => {
  const [internalError, setInternalError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const state = useMemo(
    () => ({ error: error || internalError, isLoading: isFetching }),
    [error, internalError, isFetching],
  );

  const onSubmit = useOnSubmit(
    profile,
    enqueueSnackbar,
    setInternalError,
    history,
    t,
  );

  if (isNil(profile)) { return null; }

  return (
    <ScreenAction
      title={t('screens:account.password.title')}
      state={state}
      hideAppBar
    >
      <Container maxWidth="md">
        <Formik
          validationSchema={passwordValidationSchema}
          onSubmit={onSubmit}
          initialValues={INITIAL_VALUES}
          isInitialValid
        >
          {({ isSubmitting, isValid }) => (
            <Form>
              <Box mb={2}>
                <Field
                  type="password"
                  name={OLD_PASSWORD_FIELD_NAME}
                  component={FieldTextPasswordRevealable}
                  label={t('fields:passwordOld.label')}
                />
              </Box>
              <Box mb={2}>
                <Field
                  type="password"
                  name="passwordNew"
                  component={FieldTextPasswordRevealable}
                  label={t('fields:password.label')}
                  helperText={t('fields:password.helperText')}
                />
              </Box>
              <Field
                type="password"
                name="passwordConfirm"
                component={FieldTextPasswordRevealable}
                label={t('fields:passwordConfirm.label')}
              />
              <BoxControls
                mt={3}
                primary={{
                  type: 'submit',
                  isLoading: isSubmitting,
                  isValid,
                  'aria-label': t('common:submit'),
                  text: t('common:submit'),
                }}
              />
            </Form>
          )}
        </Formik>
      </Container>
    </ScreenAction>
  );
};

AccountPassword.propTypes = {
  profile: PropTypes.shape({ id: PropTypes.string }),
  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool,
  // router props
  history: PropTypes.object.isRequired,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountPassword.defaultProps = {
  profile: null,
  error: null,
  isFetching: false,
};

export default withTranslation(['common', 'screens', 'fields'])(AccountPassword);
