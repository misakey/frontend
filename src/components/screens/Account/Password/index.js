import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { passwordValidationSchema } from 'constants/validationSchemas/profile';
import errorTypes from '@misakey/ui/constants/errorTypes';

import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import ScreenAction from 'components/dumb/Screen/Action';
import BoxControls from 'components/dumb/Box/Controls';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import { usePreparePasswordChange } from '@misakey/crypto/store/hooks';
import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

// CONSTANTS
const INITIAL_VALUES = {
  passwordOld: '',
  passwordNew: '',
  passwordConfirm: '',
};

const OLD_PASSWORD_FIELD_NAME = 'passwordOld';

// COMPONENTS
const AccountPassword = ({
  t,
  profile,
  history,
  isFetching,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const state = useMemo(
    () => ({ isLoading: isFetching }),
    [isFetching],
  );

  const preparePasswordChange = usePreparePasswordChange();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const onSubmit = useCallback(
    async (form, { setSubmitting, setFieldError }) => {
      const { passwordNew, passwordOld } = form;

      try {
        const {
          backupData,
          commitPasswordChange,
        } = await preparePasswordChange(passwordNew, passwordOld);

        await API.use(API.endpoints.user.password.update)
          .build({}, objectToSnakeCase({
            userId: profile.id,
            oldPassword: passwordOld,
            newPassword: passwordNew,
            backupData,
          }))
          .send();

        commitPasswordChange();
        enqueueSnackbar(t('account__new:password.success'), { variant: 'success' });
        history.push(routes.account._);
      } catch (e) {
        if (e instanceof BackupDecryptionError || e.code === errorTypes.forbidden) {
          setFieldError(OLD_PASSWORD_FIELD_NAME, errorTypes.invalid);
        } else if (e.httpStatus) {
          handleGenericHttpErrors(e);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [profile, enqueueSnackbar, handleGenericHttpErrors, history, t, preparePasswordChange],
  );

  if (isNil(profile)) { return null; }

  return (
    <ScreenAction
      title={t('account__new:password.title')}
      state={state}
      hideAppBar
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
                  label={t('fields__new:passwordOld.label')}
                />
              </Box>
              <Box mb={2}>
                <Field
                  type="password"
                  name="passwordNew"
                  component={FieldTextPasswordRevealable}
                  label={t('fields__new:password.label')}
                  helperText={t('fields__new:password.helperText')}
                />
              </Box>
              <Field
                type="password"
                name="passwordConfirm"
                component={FieldTextPasswordRevealable}
                label={t('fields__new:passwordConfirm.label')}
              />
              <BoxControls
                mt={3}
                primary={{
                  type: 'submit',
                  isLoading: isSubmitting,
                  'aria-label': t('common__new:submit'),
                  text: t('common__new:submit'),
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
  profile: PropTypes.shape({ id: PropTypes.string }),
  isFetching: PropTypes.bool,
  // router props
  history: PropTypes.object.isRequired,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountPassword.defaultProps = {
  profile: null,
  isFetching: false,
};

export default withTranslation(['common__new', 'account__new', 'fields__new'])(AccountPassword);
