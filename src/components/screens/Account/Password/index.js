import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { passwordForm } from 'constants/validationSchemas/profile';
import { invalid } from '@misakey/ui/constants/errorTypes';

import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import Navigation from '@misakey/ui/Navigation';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import ScreenError from 'components/dumb/Screen/Error';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import { ownerCryptoContext as cryptoContext } from '@misakey/crypto';
import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

import './index.scss';


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
    if (e instanceof BackupDecryptionError) {
      backupDecryptionError = e;
    } else {
      throw e;
    }
  }

  let response;
  try {
    response = await API.use(API.endpoints.user.password.update)
      .build({}, objectToSnakeCase({
        userId: id,
        oldPassword: passwordOld,
        newPassword: passwordNew,
        confirm: passwordConfirm,
        backupData,
      }))
      .send();
    if (!isNil(backupDecryptionError)) {
      log(backupDecryptionError, 'error');
      enqueueSnackbar(t('profile:password.backupDecryptionError'), { variant: 'error' });
    }
    return response;
  } catch (e) {
    if (e.error_code === 'invalid_password' && isNil(backupDecryptionError)) {
      log('server indicated a bad password but backup decryption seems to have succeeded', 'error');
      enqueueSnackbar(t('profile:password.backupDecryptionError'), { variant: 'error' });
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
  profile, enqueueSnackbar, setError, history, t,
) => useMemo(
  () => (form, { setSubmitting, setFieldError }) => (
    updatePassword(profile.id, form, enqueueSnackbar, t)
      .then(() => {
        cryptoContext.commitPasswordChange();
        enqueueSnackbar(t('profile:password.success'), { variant: 'success' });
        history.push(routes.account._);
      })
      .catch((error) => {
        if (error.error_code === 'invalid_password') {
          setFieldError(OLD_PASSWORD_FIELD_NAME, invalid);
        } else {
          const { httpStatus } = error;
          setError({ httpStatus });
        }
      })
      .finally(() => { setSubmitting(false); })
  ),
  [profile, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
const AccountName = ({
  t,
  profile,
  history,
}) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = useOnSubmit(
    profile,
    enqueueSnackbar,
    setError,
    history,
    t,
  );

  if (isNil(profile)) { return null; }

  if (error) {
    return <ScreenError {...error} />;
  }
  return (
    <div className="Name">
      <div className="header">
        <Navigation pushPath={routes.account._} title={t('profile:password.title')} />
        <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
          {t('profile:password.subtitle')}
        </Typography>
      </div>
      <Formik
        validationSchema={passwordForm}
        onSubmit={onSubmit}
        initialValues={INITIAL_VALUES}
        isInitialValid
      >
        {({ isSubmitting, isValid }) => (
          <Container maxWidth="sm" className="content">
            <Form className="form">
              <Field
                className="field"
                type="password"
                name={OLD_PASSWORD_FIELD_NAME}
                component={FieldTextPasswordRevealable}
                label={t('profile:form.field.passwordOld.label')}
              />
              <Field
                className="field"
                type="password"
                name="passwordNew"
                component={FieldTextPasswordRevealable}
                label={t('profile:form.field.password.label')}
                helperText={t('profile:form.field.password.hint')}
              />
              <Field
                className="field"
                type="password"
                name="passwordConfirm"
                component={FieldTextPasswordRevealable}
                label={t('profile:form.field.passwordConfirm.label')}
              />

              <ButtonSubmit isSubmitting={isSubmitting} isValid={isValid}>
                {t('submit')}
              </ButtonSubmit>
            </Form>
          </Container>
        )}
      </Formik>
    </div>
  );
};

AccountName.propTypes = {
  profile: PropTypes.shape({ id: PropTypes.string }),

  // router props
  history: PropTypes.object.isRequired,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountName.defaultProps = {
  profile: null,
};

export default withTranslation(['common', 'profile'])(AccountName);
