import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { forgotConfirmValidationSchema, forgotResetPasswordValidationSchema } from 'constants/validationSchemas/auth';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import useAsync from '@misakey/hooks/useAsync';

import Redirect from '@misakey/ui/Redirect';
import FormCard from '@misakey/ui/Form/Card';
import Button from '@material-ui/core/Button';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import FieldText from '@misakey/ui/Form/Field/Text';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import ScreenError from 'components/dumb/Screen/Error';
import ChipUser from 'components/dumb/Chip/User';
import AuthForgotSubtitle from 'components/screens/Auth/Forgot/Subtitle';

import 'components/screens/Auth/Forgot/index.scss';

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

// HELPERS
const getOtpError = path(['details', 'otp']);

const handleError = (setError, setFieldError, setStep) => (error) => {
  const errorOTP = getOtpError(error);
  if (error.code === forbidden && !isNil(errorOTP)) {
    setFieldError(CONFIRM_FIELD_NAME, errorOTP);
    setStep(STEP_CONFIRM);
  } else {
    const { httpStatus } = error;
    setError({ httpStatus });
  }
};

// @FIXME temporary converter, remove when backend no more uses "otp"
const convertForm = (form) => {
  const otp = form[CONFIRM_FIELD_NAME];
  return { otp, newPassword: form[PASSWORD_FIELD_NAME] };
};
const isStepConfirm = (step) => step === STEP_CONFIRM;

const fetchUserPublicData = (email) => API.use(API.endpoints.user.public.read)
  .build({ email })
  .send()
  .then((response) => objectToCamelCase(response));

const askResetPassword = (email, isAuthenticated) => {
  const endpoint = API.endpoints.user.password.askReset;

  if (!isAuthenticated) { endpoint.auth = false; }

  return API
    .use(endpoint)
    .build(undefined, { email })
    .send();
};

const confirmCode = (email, form, isAuthenticated) => {
  const endpoint = API.endpoints.user.password.confirmCode;

  if (!isAuthenticated) { endpoint.auth = false; }

  return API
    .use(endpoint)
    .build(undefined, { email, ...objectToSnakeCase(convertForm(form)) })
    .send();
};

const resetPassword = (email, code, form, isAuthenticated) => {
  const endpoint = API.endpoints.user.password.reset;

  if (!isAuthenticated) { endpoint.auth = false; }

  return API
    .use(endpoint)
    .build(undefined, { email, ...objectToSnakeCase(convertForm(form)), otp: code })
    .send();
};

// HOOKS
const useGetUserPublicData = (email) => useCallback(
  () => (isEmpty(email) ? Promise.resolve() : fetchUserPublicData(email)),
  [email],
);
const useValidationSchema = (step) => useMemo(() => {
  if (step === STEP_CONFIRM) {
    return forgotConfirmValidationSchema;
  }

  return forgotResetPasswordValidationSchema;
}, [step]);

const useOnNext = (email, setStep, setCode, setError, t, isAuthenticated) => useCallback(
  (form, { setSubmitting, setFieldError }) => confirmCode(email, form, isAuthenticated)
    .then(({ otp }) => {
      setStep(STEP_RESET);
      setCode(otp);
    })
    .catch(handleError(setError, setFieldError, setStep))
    .finally(() => { setSubmitting(false); }),
  [email, setStep, setCode, setError, isAuthenticated],
);

const useOnReset = (
  email, code, enqueueSnackbar, setError,
  history, setStep, t, isAuthenticated, challenge,
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
    .catch(handleError(setError, setFieldError, setStep))
    .finally(() => { setSubmitting(false); }),
  [email, code, enqueueSnackbar, setError, setStep, t, isAuthenticated, challenge],
);

const useOnPrevious = (history) => useCallback(() => {
  history.push({
    pathname: routes.auth.signIn,
  });
}, [history]);

const useAskResetPassword = (email, step, isAuthenticated) => useEffect(() => {
  if (!isEmpty(email) && isStepConfirm(step)) {
    askResetPassword(email, isAuthenticated);
  }
}, [email, step, isAuthenticated]);

// COMPONENTS
const AuthForgot = ({ challenge, email, t, history, isAuthenticated }) => {
  const [code, setCode] = useState();
  const [step, setStep] = useState(STEP_CONFIRM);
  const [error, setError] = useState();

  const isEmptyEmail = useMemo(() => isEmpty(email), [email]);

  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = useValidationSchema(step);

  const getUserPublicData = useGetUserPublicData(email);
  const userPublicData = useAsync(getUserPublicData, email);

  const onNext = useOnNext(email, setStep, setCode, setError, t, isAuthenticated);
  const onReset = useOnReset(
    email, code, enqueueSnackbar, setError, history, setStep, t, isAuthenticated, challenge,
  );

  const onSubmit = useMemo(() => (isStepConfirm(step) ? onNext : onReset), [step, onNext, onReset]);
  const onPrevious = useOnPrevious(history);

  useAskResetPassword(email, step, isAuthenticated);

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  if (isEmptyEmail) {
    return <Redirect to={routes.auth.signIn} />;
  }

  if (isNil(userPublicData)) {
    return null;
  }

  return (
    <div className="Forgot">
      <Formik
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        initialValues={INITIAL_VALUES}
      >
        {({ isSubmitting, isValid }) => (
          <FormCard
            title={t('auth:forgotPassword.title')}
            subtitle={<AuthForgotSubtitle name={step} email={email} />}
            actions={(
              <div className="actions">
                <Button
                  variant="contained"
                  type="button"
                  onClick={onPrevious}
                >
                  {t('common:previous')}
                </Button>
                <ButtonSubmit
                  isSubmitting={isSubmitting}
                  isValid={isValid}
                >
                  {t(`auth:forgotPassword.form.action.${step}`)}
                </ButtonSubmit>
              </div>
            )}
          >
            <div className="content">
              <ChipUser
                email={email}
                {...userPublicData}
                onClick={onPrevious}
                onDelete={onPrevious}
              />
              {isStepConfirm(step)
                ? (
                  <Field
                    className="field"
                    type="text"
                    name={CONFIRM_FIELD_NAME}
                    component={FieldText}
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
            </div>
          </FormCard>
        )}
      </Formik>
    </div>
  );
};

AuthForgot.propTypes = {
  challenge: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

// CONNECT
const mapStateToProps = (state) => ({
  challenge: state.sso.loginChallenge,
  email: state.screens.auth.email,
  isAuthenticated: !!state.auth.token,
});

export default connect(mapStateToProps)(withTranslation(['auth', 'common'])(AuthForgot));
