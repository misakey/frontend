import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import { Redirect } from 'react-router-dom';

import API from '@misakey/api';
import routes from 'routes';
import { signUpConfirmValidationSchema } from 'constants/validationSchemas/auth';

import isEmpty from '@misakey/helpers/isEmpty';
import isObject from '@misakey/helpers/isObject';
import join from '@misakey/helpers/join';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { screenAuthSetCredentials, screenAuthSetPublics } from 'store/actions/screens/auth';

import Box from '@material-ui/core/Box';
import FormCardAuth from 'components/dumb/Form/Card/Auth';
import FieldCode from 'components/dumb/Form/Field/Code';
import Fields from '@misakey/ui/Form/Fields';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import ChipUser from 'components/dumb/Chip/User';
import CardHeaderAuthSignUp from 'components/smart/Card/Header/Auth/SignUp';

// CONSTANTS
const DEFAULT_FIELDS = {
  code: {
    component: FieldCode,
    inputProps: { 'data-matomo-ignore': true, placeholder: '' },
    formatFieldValue: (values) => join(values, ''),
    autoFocus: true,
  },
};

const PARENT_TO = routes.auth.signIn;

// HELPERS
const fetchConfirm = (payload) => API
  .use(API.endpoints.auth.confirm)
  .build(undefined, payload)
  .send();

const fetchAskConfirm = (email) => API
  .use(API.endpoints.auth.askConfirm)
  .build(undefined, { email })
  .send();

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
  const handleGenericHttpErrors = useHandleGenericHttpErrors();
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
          if (isObject(e.details)) {
            setFieldError('code', e.details.otp);
          } else {
            handleGenericHttpErrors(e);
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    [handleGenericHttpErrors, history],
  );

  const reSendConfirmCode = useCallback(
    () => {
      setSending(true);

      fetchAskConfirm(email)
        .then(() => {
          const text = t('auth:signUp.confirm.success.resend', { email });
          enqueueSnackbar(text, { variant: 'success' });
        })
        .catch(handleGenericHttpErrors)
        .finally(() => setSending(false));
    },
    [email, enqueueSnackbar, setSending, t, handleGenericHttpErrors],
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
