import React, { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
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

import preparePasswordChange from '@misakey/crypto/store/actions/preparePasswordChange';
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

  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async (form, { setSubmitting, setFieldError }) => {
      const { passwordNew, passwordOld } = form;

      try {
        const {
          backupData,
          commitPasswordChange,
        } = await dispatch(preparePasswordChange(passwordNew, passwordOld));

        await API.use(API.endpoints.user.password.update)
          .build({}, objectToSnakeCase({
            userId: profile.id,
            oldPassword: passwordOld,
            newPassword: passwordNew,
            backupData,
          }))
          .send();

        commitPasswordChange();
        enqueueSnackbar(t('account:password.success'), { variant: 'success' });
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
    [profile, enqueueSnackbar, handleGenericHttpErrors, dispatch, history, t],
  );

  if (isNil(profile)) { return null; }

  return (
    <ScreenAction
      title={t('account:password.title')}
      state={state}
      appBarProps={{ withSearchBar: false }}
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

export default withTranslation(['common', 'account', 'fields'])(AccountPassword);
