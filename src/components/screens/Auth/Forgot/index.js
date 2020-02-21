import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field } from 'formik';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';


import routes from 'routes';
import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { forgotConfirmValidationSchema, forgotResetPasswordValidationSchema } from 'constants/validationSchemas/auth';

import { screenAuthSetCredentials } from 'store/actions/screens/auth';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import join from '@misakey/helpers/join';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';

import useAsync from '@misakey/hooks/useAsync';

import Redirect from 'components/dumb/Redirect';
import FormCardAuth from 'components/dumb/Form/Card/Auth';

import { hardPasswordChange } from '@misakey/crypto';

import Box from '@material-ui/core/Box';
import FieldCode from 'components/dumb/Form/Field/Code';

import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import ChipUser from 'components/dumb/Chip/User';
import AuthForgotSubtitle from 'components/screens/Auth/Forgot/Subtitle';
import CardHeaderAuth from 'components/smart/Card/Header/Auth';

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

const PARENT_TO = routes.auth.signIn;

// HELPERS
const getOtpError = path(['details', 'otp']);

const handleError = (setFieldError, setStep, handleGenericHttpErrors) => (error) => {
  const errorOTP = getOtpError(error);
  if (error.code === forbidden && !isNil(errorOTP)) {
    setFieldError(CONFIRM_FIELD_NAME, errorOTP);
    setStep(STEP_CONFIRM);
  } else if (isEmpty(error.details)) {
    handleGenericHttpErrors(error);
  }
};

// @FIXME temporary converter, remove when backend no more uses "otp"
const convertForm = (form) => {
  const otp = form[CONFIRM_FIELD_NAME];
  return { otp, newPassword: form[PASSWORD_FIELD_NAME] };
};
const isStepConfirm = (step) => step === STEP_CONFIRM;

const fetchUserPublicData = (
  email, handleGenericHttpErrors,
) => API.use(API.endpoints.user.public.read)
  .build({ email })
  .send()
  .then(objectToCamelCase)
  .catch(handleGenericHttpErrors);

const askResetPassword = (email, isAuthenticated, handleGenericHttpErrors) => {
  const endpoint = API.endpoints.user.password.askReset;

  if (!isAuthenticated) { endpoint.auth = false; }

  return API
    .use(endpoint)
    .build(undefined, { email })
    .send()
    .catch(handleGenericHttpErrors);
};

const confirmCode = (email, form, isAuthenticated) => {
  const endpoint = API.endpoints.user.password.confirmCode;

  if (!isAuthenticated) { endpoint.auth = false; }

  return API
    .use(endpoint)
    .build(undefined, { email, ...objectToSnakeCase(convertForm(form)) })
    .send();
};

const resetPassword = async (email, code, form, isAuthenticated) => {
  const endpoint = API.endpoints.user.password.reset;

  if (!isAuthenticated) { endpoint.auth = false; }

  const newPassword = form[PASSWORD_FIELD_NAME];

  const newCryptoValues = await hardPasswordChange(newPassword);

  return API
    .use(endpoint)
    .build(
      undefined,
      objectToSnakeCaseDeep({
        email,
        ...convertForm(form),
        otp: code,
        ...newCryptoValues,
      }),
    )
    .send();
};

const formatFieldValue = (values) => join(values, '');

// HOOKS
const useGetUserPublicData = (email, handleGenericHttpErrors) => useCallback(
  () => (isEmpty(email) ? Promise.resolve() : fetchUserPublicData(email, handleGenericHttpErrors)),
  [email, handleGenericHttpErrors],
);
const useValidationSchema = (step) => useMemo(() => {
  if (step === STEP_CONFIRM) {
    return forgotConfirmValidationSchema;
  }

  return forgotResetPasswordValidationSchema;
}, [step]);

const useOnNext = (
  email, setStep, setCode, isAuthenticated, handleGenericHttpErrors,
) => useCallback(
  (form, { setSubmitting, setFieldError }) => confirmCode(email, form, isAuthenticated)
    .then(({ otp }) => {
      setStep(STEP_RESET);
      setCode(otp);
    })
    .catch(handleError(setFieldError, setStep, handleGenericHttpErrors))
    .finally(() => { setSubmitting(false); }),
  [email, setStep, setCode, isAuthenticated, handleGenericHttpErrors],
);

const useOnReset = (
  email, code, enqueueSnackbar, setStep, t, isAuthenticated, challenge, handleGenericHttpErrors,
) => useCallback(
  (form, { setSubmitting, setFieldError }) => resetPassword(email, code, form, isAuthenticated)
    .then(() => {
      const payload = { email, password: form.passwordNew, challenge };
      return API.use(API.endpoints.auth.signIn)
        .build(undefined, payload).send().then((response) => {
          enqueueSnackbar(t('auth:forgotPassword.success'), { variant: 'success' });
          window.location.replace(response.redirect_to);
        });
    })
    .catch(handleError(setFieldError, setStep, handleGenericHttpErrors))
    .finally(() => { setSubmitting(false); }),
  [
    email, code, enqueueSnackbar, setStep, t, isAuthenticated, challenge, handleGenericHttpErrors,
  ],
);

const useAskResetPassword = (
  email, step, isAuthenticated, handleGenericHttpErrors,
) => useEffect(() => {
  if (!isEmpty(email) && isStepConfirm(step)) {
    askResetPassword(email, isAuthenticated, handleGenericHttpErrors);
  }
}, [email, step, isAuthenticated, handleGenericHttpErrors]);

// COMPONENTS
const AuthForgot = ({
  challenge,
  email,
  t,
  history,
  isAuthenticated,
  dispatchClearCredentials,
}) => {
  const [code, setCode] = useState();
  const [step, setStep] = useState(STEP_CONFIRM);

  const isEmptyEmail = useMemo(() => isEmpty(email), [email]);

  const { enqueueSnackbar } = useSnackbar();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const validationSchema = useValidationSchema(step);

  const getUserPublicData = useGetUserPublicData(email, handleGenericHttpErrors);
  const userPublicData = useAsync(getUserPublicData, email);

  const onNext = useOnNext(email, setStep, setCode, isAuthenticated, handleGenericHttpErrors);
  const onReset = useOnReset(
    email, code, enqueueSnackbar, setStep, t, isAuthenticated, challenge, handleGenericHttpErrors,
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

  useAskResetPassword(email, step, isAuthenticated, handleGenericHttpErrors);

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
                className="field"
                type="text"
                name={CONFIRM_FIELD_NAME}
                component={FieldCode}
                formatFieldValue={formatFieldValue}
                helperText=""
                inputProps={{ 'data-matomo-ignore': true }}
                label={t('auth:forgotPassword.form.field.confirm.label')}
              />
            )
            : (
              <Field
                className="field"
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
};

// CONNECT
const mapStateToProps = (state) => ({
  challenge: state.sso.loginChallenge,
  email: state.screens.auth.identifier,
  isAuthenticated: !!state.auth.token,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchClearCredentials: () => dispatch(
    screenAuthSetCredentials(),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['auth', 'common'])(AuthForgot));
