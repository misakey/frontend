import React, { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import { passwordValidationSchema } from 'constants/validationSchemas/identity';
import errorTypes from '@misakey/ui/constants/errorTypes';

import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import changePassword from '@misakey/auth/builder/changePassword';

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
  passwordOld: '',
  passwordNew: '',
  passwordConfirm: '',
};

const OLD_PASSWORD_FIELD_NAME = 'passwordOld';

// from https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#Preventing_autofilling_with_autocompletenew-password
const NEW_PASSWORD_INPUT_PROPS = {
  autoComplete: 'new-password',
};

const NAVIGATION_PROPS = {
  homePath: routes.account._,
};

// COMPONENTS
const AccountPassword = ({ t, identity, history, isFetching }) => {
  const { enqueueSnackbar } = useSnackbar();

  const state = useMemo(
    () => ({ isLoading: isFetching }),
    [isFetching],
  );

  const handleHttpErrors = useHandleHttpErrors();

  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async (form, { setSubmitting, setFieldError }) => {
      const { passwordNew, passwordOld } = form;

      try {
        const {
          backupData,
          backupVersion,
          commitPasswordChange,
        } = await dispatch(preparePasswordChange(passwordNew, passwordOld));

        await changePassword({
          identity,
          oldPassword: passwordOld,
          newPassword: passwordNew,
          backupData,
          backupVersion,
        });

        commitPasswordChange();
        enqueueSnackbar(t('account:password.success'), { variant: 'success' });
        history.push(routes.account._);
      } catch (e) {
        if (e instanceof BackupDecryptionError || e.code === errorTypes.forbidden) {
          setFieldError(OLD_PASSWORD_FIELD_NAME, errorTypes.invalid);
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
    [identity, enqueueSnackbar, handleHttpErrors, dispatch, history, t],
  );

  if (isNil(identity)) { return null; }

  return (
    <ScreenAction
      title={t('account:password.title')}
      state={state}
      navigationProps={NAVIGATION_PROPS}
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
                  inputProps={NEW_PASSWORD_INPUT_PROPS}
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
  // router props
  history: PropTypes.object.isRequired,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountPassword.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation(['common', 'account', 'fields'])(AccountPassword);
