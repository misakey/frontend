import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field } from 'formik';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';


import routes from 'routes';
import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { forgotConfirmValidationSchema, forgotResetPasswordValidationSchema } from 'constants/validationSchemas/auth';

import { screenAuthSetCredentials } from 'store/actions/screens/auth';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import useAsync from '@misakey/hooks/useAsync';

import resetPassword from '@misakey/auth/builder/resetPassword';
import loginAuthStep from '@misakey/auth/builder/loginAuthStep';
import fetchPwdHashParams from '@misakey/auth/builder/fetchPwdHashParams';

import Redirect from 'components/dumb/Redirect';
import FormCardAuth from 'components/dumb/Form/Card/Auth';

import hardPasswordChange from '@misakey/crypto/store/actions/hardPasswordChange';
import { setBackupVersion } from '@misakey/crypto/store/actions/concrete';

import Box from '@material-ui/core/Box';
import FieldCode from 'components/dumb/Form/Field/Code';

import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import ChipUser from 'components/dumb/Chip/User';
import AuthForgotSubtitle from 'components/screens/Auth/Forgot/Subtitle';
import CardHeaderAuth from 'components/smart/Card/Auth/Header';

// CONSTANTS
const { forbidden } = errorTypes;
const STEP_CONFIRM = 'confirm';
const STEP_RESET = 'resetPassword';

const CONFIRM_FIELD_NAME = 'confirmationCode';
const PASSWORD_FIELD_NAME = 'passwordNew';

const INITIAL_VALUES = {
  [CONFIRM_FIELD_NAME]: '',
  [PASSWORD_FIELD_NAME]: '',
};

const PARENT_TO = routes.auth.signIn._;

// HELPERS
const getOtpError = path(['details', 'otp']);

const handleError = (setFieldError, setStep, handleHttpErrors) => (error) => {
  const errorOTP = getOtpError(error);
  if (error.code === forbidden && !isNil(errorOTP)) {
    setFieldError(CONFIRM_FIELD_NAME, errorOTP);
    setStep(STEP_CONFIRM);
  } else if (isEmpty(error.details)) {
    handleHttpErrors(error);
  }
};

// @FIXME temporary converter, remove when backend no more uses "otp"
const convertForm = (form) => {
  const otp = form[CONFIRM_FIELD_NAME];
  return { otp, newPassword: form[PASSWORD_FIELD_NAME] };
};
const isStepConfirm = (step) => step === STEP_CONFIRM;

const fetchUserPublicData = (
  email, handleHttpErrors,
) => API.use(API.endpoints.user.public.read)
  .build({ email })
  .send()
  .then(objectToCamelCase)
  .catch(handleHttpErrors);

const askResetPassword = (email, isAuthenticated, handleHttpErrors) => {
  const endpoint = API.endpoints.user.password.askReset;

  if (!isAuthenticated) { endpoint.auth = false; }

  return API
    .use(endpoint)
    .build(undefined, { email })
    .send()
    .catch(handleHttpErrors);
};

const confirmCode = (email, form, isAuthenticated) => {
  const endpoint = API.endpoints.user.password.confirmCode;

  if (!isAuthenticated) { endpoint.auth = false; }

  return API
    .use(endpoint)
    .build(undefined, { email, ...objectToSnakeCase(convertForm(form)) })
    .send();
};

// HOOKS
const useGetUserPublicData = (email, handleHttpErrors) => useCallback(
  () => (isEmpty(email) ? Promise.resolve() : fetchUserPublicData(email, handleHttpErrors)),
  [email, handleHttpErrors],
);
const useValidationSchema = (step) => useMemo(() => {
  if (step === STEP_CONFIRM) {
    return forgotConfirmValidationSchema;
  }

  return forgotResetPasswordValidationSchema;
}, [step]);

const useOnNext = (
  email, setStep, setCode, isAuthenticated, handleHttpErrors,
) => useCallback(
  (form, { setSubmitting, setFieldError }) => confirmCode(email, form, isAuthenticated)
    .then(({ otp }) => {
      setStep(STEP_RESET);
      setCode(otp);
    })
    .catch(handleError(setFieldError, setStep, handleHttpErrors))
    .finally(() => { setSubmitting(false); }),
  [email, setStep, setCode, isAuthenticated, handleHttpErrors],
);

const useOnReset = (
  email,
  code,
  enqueueSnackbar,
  setStep,
  t,
  isAuthenticated,
  challenge,
  handleHttpErrors,
  dispatchHardPasswordChange,
  dispatchSetBackupVersion,
) => useCallback(
  async (form, { setSubmitting, setFieldError }) => {
    const newPassword = form[PASSWORD_FIELD_NAME];
    try {
      await resetPassword({
        email,
        confirmationCode: code,
        newPassword,
        dispatchHardPasswordChange,
        dispatchSetBackupVersion,
        auth: isAuthenticated,
      });

      const pwdHashParams = await fetchPwdHashParams({ email });

      const signInResponse = await loginAuthStep({
        challenge,
        email,
        secret: newPassword,
        acr: 2,
        pwdHashParams,
      });
      enqueueSnackbar(t('auth:forgotPassword.success'), { variant: 'success' });
      window.location.replace(signInResponse.redirect_to);
    } catch (e) {
      handleError(setFieldError, setStep, handleHttpErrors)(e);
    } finally {
      setSubmitting(false);
    }
  },
  [
    email,
    code,
    enqueueSnackbar,
    setStep,
    t,
    isAuthenticated,
    challenge,
    handleHttpErrors,
    dispatchHardPasswordChange,
    dispatchSetBackupVersion,
  ],
);

const useAskResetPassword = (
  email, step, isAuthenticated, handleHttpErrors,
) => useEffect(() => {
  if (!isEmpty(email) && isStepConfirm(step)) {
    askResetPassword(email, isAuthenticated, handleHttpErrors);
  }
}, [email, step, isAuthenticated, handleHttpErrors]);

// COMPONENTS
const AuthForgot = ({
  challenge,
  email,
  t,
  history,
  isAuthenticated,
  dispatchClearCredentials,
  dispatchHardPasswordChange,
  dispatchSetBackupVersion,
}) => {
  const [code, setCode] = useState();
  const [step, setStep] = useState(STEP_CONFIRM);

  const isEmptyEmail = useMemo(() => isEmpty(email), [email]);

  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const validationSchema = useValidationSchema(step);

  const getUserPublicData = useGetUserPublicData(email, handleHttpErrors);
  const userPublicData = useAsync(getUserPublicData, email);

  const onNext = useOnNext(email, setStep, setCode, isAuthenticated, handleHttpErrors);
  const onReset = useOnReset(
    email, code, enqueueSnackbar, setStep, t, isAuthenticated, challenge, handleHttpErrors,
    dispatchHardPasswordChange, dispatchSetBackupVersion,
  );

  const onSubmit = useMemo(() => (isStepConfirm(step) ? onNext : onReset), [step, onNext, onReset]);

  const onClearUser = useCallback(
    () => {
      dispatchClearCredentials();
      history.push({
        pathname: PARENT_TO,
      });
    },
    [dispatchClearCredentials, history],
  );

  useAskResetPassword(email, step, isAuthenticated, handleHttpErrors);

  if (isEmptyEmail) {
    return <Redirect to={PARENT_TO} />;
  }

  if (isNil(userPublicData)) {
    return null;
  }

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      <FormCardAuth
        title={t('auth:forgotPassword.title')}
        subtitle={<AuthForgotSubtitle name={step} email={email} />}
        secondary={{ text: t('common:previous'), component: Link, to: PARENT_TO }}
        primary={{
          type: 'submit',
          text: t(`auth:forgotPassword.form.action.${step}`),
        }}
        Header={CardHeaderAuth}
        formik
      >
        <Box alignItems="center" flexDirection="column" display="flex">
          <ChipUser
            label={email}
            {...userPublicData}
            onClick={onClearUser}
            onDelete={onClearUser}
          />
          {isStepConfirm(step)
            ? (
              <Field
                type="text"
                name={CONFIRM_FIELD_NAME}
                component={FieldCode}
                label={t('auth:forgotPassword.form.field.confirm.label')}
                autoFocus
              />
            )
            : (
              <Field
                type="password"
                name={PASSWORD_FIELD_NAME}
                component={FieldTextPasswordRevealable}
                label={t('auth:forgotPassword.form.field.password.label')}
              />
            )}
        </Box>
      </FormCardAuth>
    </Formik>
  );
};

AuthForgot.propTypes = {
  // ROUTER
  history: PropTypes.object.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  challenge: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  dispatchClearCredentials: PropTypes.func.isRequired,
  dispatchHardPasswordChange: PropTypes.func.isRequired,
  dispatchSetBackupVersion: PropTypes.func.isRequired,
};

// CONNECT
const mapStateToProps = (state) => ({
  challenge: state.sso.loginChallenge,
  email: state.screens.auth.identifier,
  isAuthenticated: state.auth.isAuthenticated,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchClearCredentials: () => dispatch(
    screenAuthSetCredentials(),
  ),
  dispatchHardPasswordChange: (newPassword) => dispatch(hardPasswordChange(newPassword)),
  dispatchSetBackupVersion: (version) => dispatch(setBackupVersion(version)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['auth', 'common'])(AuthForgot));
