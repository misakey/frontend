import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { connect } from 'react-redux';
import Formik from '@misakey/ui/Formik';
import { Redirect } from 'react-router-dom';

import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';


import routes from 'routes';
import { signUpConfirmValidationSchema } from 'constants/validationSchemas/auth';

import { getCode } from '@misakey/helpers/apiError';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { screenAuthSetCredentials, screenAuthSetPublics } from 'store/actions/screens/auth';

import Box from '@material-ui/core/Box';
import FormCardAuth from 'components/dumb/Form/Card/Auth';
import FieldCode from 'components/dumb/Form/Field/Code';
import Fields from '@misakey/ui/Form/Fields';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ChipUser from 'components/dumb/Chip/User';
import CardHeaderAuthSignUp from 'components/smart/Card/Auth/Header/SignUp';

// CONSTANTS
const DEFAULT_FIELDS = {
  code: {
    component: FieldCode,
    autoFocus: true,
  },
};

const { conflict } = errorTypes;

const PARENT_TO = routes.auth.signIn._;

// HELPERS
const fetchConfirm = (payload) => API
  .use(API.endpoints.auth.confirm)
  .build(undefined, payload)
  .send();

const fetchAskConfirm = (email) => API
  .use(API.endpoints.auth.askConfirm)
  .build(undefined, { email })
  .send();

const getCodeError = path(['details', 'code']);
const getEmailError = path(['details', 'email']);


// HOOKS
const useStyles = makeStyles(() => ({
  buttonRoot: {
    width: 'auto',
  },
  formRoot: {
    width: '100%',
    alignItems: 'center',
  },
}));

// COMPONENTS
const SignUpConfirmFormFields = (fields) => (
  <Fields fields={fields} prefix="signUpConfirm." defaultFields={DEFAULT_FIELDS} />
);

SignUpConfirmFormFields.defaultProps = DEFAULT_FIELDS;

function AuthSignUpConfirm({
  email,
  password,
  publics,
  challenge,
  t,
  dispatchClearCredentials,
  history,
}) {
  const classes = useStyles();
  const handleHttpErrors = useHandleHttpErrors();
  const { enqueueSnackbar } = useSnackbar();

  const [isSending, setSending] = useState(false);

  const initialValues = useMemo(
    () => ({
      email,
      password,
      challenge,
      code: '',
    }),
    [email, password, challenge],
  );

  const onSubmit = useCallback(
    (values, { setFieldError, setSubmitting }) => {
      const payload = { email: values.email, otp: values.code };

      return fetchConfirm(payload)
        .then(() => { history.push(routes.auth.signUp.finale); })
        .catch((e) => {
          const codeError = getCodeError(e);
          const emailError = getEmailError(e);

          if (!isNil(codeError)) {
            setFieldError('code', codeError);
          } else if (!isNil(emailError)) {
            setFieldError('code', emailError);
          } else {
            handleHttpErrors(e);
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    [handleHttpErrors, history],
  );

  const reSendConfirmCode = useCallback(
    () => {
      setSending(true);

      fetchAskConfirm(email)
        .then(() => {
          const text = t('auth:signUp.confirm.success.resend', { email });
          enqueueSnackbar(text, { variant: 'success' });
        })
        .catch((e) => {
          const errorCode = getCode(e);
          if (errorCode === conflict) {
            enqueueSnackbar(t('auth:signUp.confirm.error.conflict'), { variant: 'error' });
          } else {
            handleHttpErrors(e);
          }
        })
        .finally(() => setSending(false));
    },
    [email, enqueueSnackbar, setSending, t, handleHttpErrors],
  );

  const signUpConfirmContentAction = useMemo(
    () => ({
      onClick: reSendConfirmCode,
      isLoading: isSending,
      disabled: isSending,
      text: t('auth:signUp.confirm.action.resend'),
    }),
    [isSending, reSendConfirmCode, t],
  );

  const onClearUser = useCallback(
    () => {
      dispatchClearCredentials();
    },
    [dispatchClearCredentials],
  );

  if (isEmpty(email)) { return <Redirect to={PARENT_TO} />; }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={signUpConfirmValidationSchema}
      onSubmit={onSubmit}
    >
      <FormCardAuth
        primary={{
          type: 'submit',
          text: t('common:next'),
        }}
        title={t('auth:signUp.confirm.title')}
        subtitle={t('auth:signUp.confirm.subtitle')}
        Header={CardHeaderAuthSignUp}
        formik
      >
        <Box display="flex" justifyContent="center" mb={1}>
          <ChipUser
            label={email}
            {...publics}
            onClick={onClearUser}
            onDelete={onClearUser}
          />
        </Box>
        <Box display="flex" justifyContent="center">
          <SignUpConfirmFormFields />
        </Box>
        <Button
          standing={BUTTON_STANDINGS.TEXT}
          classes={{ buttonRoot: classes.buttonRoot }}
          {...signUpConfirmContentAction}
        />
      </FormCardAuth>
    </Formik>
  );
}

AuthSignUpConfirm.propTypes = {
  // ROUTER
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  email: PropTypes.string,
  password: PropTypes.string,
  publics: PropTypes.object,
  challenge: PropTypes.string,
  dispatchClearCredentials: PropTypes.func.isRequired,
};

AuthSignUpConfirm.defaultProps = {
  email: '',
  password: '',
  publics: {},
  challenge: '',
};

// CONNECT
const mapStateToProps = (state) => ({
  email: state.screens.auth.identifier,
  password: state.screens.auth.secret,
  publics: state.screens.auth.publics,
  challenge: state.sso.loginChallenge,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchClearCredentials: () => Promise.all([
    dispatch(screenAuthSetCredentials()),
    dispatch(screenAuthSetPublics()),
  ]),
});


export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['auth', 'common'])(AuthSignUpConfirm));
