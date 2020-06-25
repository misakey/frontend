import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import moment from 'moment';

import { STEP, INITIAL_VALUES, ERROR_KEYS } from 'constants/auth';
import { getSecretValidationSchema } from 'constants/validationSchemas/auth';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';
import hardPasswordChange from '@misakey/crypto/store/actions/hardPasswordChange';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { DATE_FULL } from 'constants/formats/dates';
import { EMAILED_CODE, PREHASHED_PASSWORD } from '@misakey/auth/constants/method';

import compose from '@misakey/helpers/compose';
import head from '@misakey/helpers/head';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import props from '@misakey/helpers/props';
import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';
import log from '@misakey/helpers/log';
import loginAuthStep from '@misakey/auth/builder/loginAuthStep';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useCancelForgotPassword from '@misakey/auth/hooks/useCancelForgotPassword';
import { useClearUser } from '@misakey/hooks/useActions/loginSecret';

import Box from '@material-ui/core/Box';
import DefaultSplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import SecretFormFields from 'components/screens/Auth/Login/Secret/Form/Fields';
import Redirect from 'components/dumb/Redirect';
import ChipUser from 'components/dumb/Chip/User';
import TitleWithCancelIcon from 'components/dumb/Typography/Title/WithCancelIcon';
import BoxControls from '@misakey/ui/Box/Controls';
import ButtonForgotPassword from '@misakey/auth/components/Button/ForgotPassword';
import ButtonRenewAuthStep from '@misakey/auth/components/Button/RenewAuthStep';
import DialogPasswordReset from 'components/smart/Dialog/Password/Reset';

// CONSTANTS
const { conflict } = errorTypes;
const CURRENT_STEP = STEP.secret;

// HELPERS
const getSecretError = compose(
  head,
  (errors) => errors.filter((error) => !isNil(error)),
  props(ERROR_KEYS[CURRENT_STEP]),
);

// HOOKS
const useStyles = makeStyles(() => ({
  buttonRoot: {
    width: 'auto',
  },
}));


// COMPONENTS
const AuthLoginSecret = ({
  identifier,
  authnStep,
  identity,
  loginChallenge,
  dispatchHardPasswordChange,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const cancelForgotPassword = useCancelForgotPassword();

  const [redirectTo, setRedirectTo] = useState(null);

  const [reset, setReset] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);


  const initialValues = useMemo(() => INITIAL_VALUES[CURRENT_STEP], []);

  const { methodName, identityId, metadata: pwdHashParams } = useMemo(
    () => authnStep || {},
    [authnStep],
  );

  const validationSchema = useMemo(
    () => getSecretValidationSchema(methodName),
    [methodName],
  );

  const userPublicData = useMemo(
    () => ({ ...identity, identifier }),
    [identifier, identity],
  );

  const onForgotPasswordDone = useCallback(
    () => {
      setReset(true);
    },
    [setReset],
  );

  const onCancelForgotPassword = useCallback(
    () => {
      setReset(false);
      cancelForgotPassword();
    },
    [cancelForgotPassword],
  );

  const handleResetSubmit = useCallback(
    () => {
      setDialogOpen(true);
    },
    [setDialogOpen],
  );

  const onDialogClose = useCallback(
    () => {
      setDialogOpen(false);
      setReset(true);
    },
    [setDialogOpen, setReset],
  );

  const onDialogSubmit = useCallback(
    () => {
      setReset(false);
    },
    [setReset],
  );

  const handleSubmit = useCallback(
    (values, { setFieldError, setSubmitting, setFieldValue }) => {
      setRedirectTo(null);

      loginAuthStep({
        loginChallenge,
        identityId,
        methodName,
        pwdHashParams,
        dispatchHardPasswordChange,
        ...values,
      })
        .then((response) => {
          const { redirectTo: nextRedirectTo } = objectToCamelCase(response);
          setRedirectTo(nextRedirectTo);
        })
        .catch((e) => {
          // in case reset password dialog is open, close dialog before setting field error
          if (dialogOpen) {
            onDialogClose();
          }
          const details = getDetails(e);
          const secretError = getSecretError(details);
          if (!isNil(secretError)) {
            if (methodName === EMAILED_CODE) {
              setFieldValue(CURRENT_STEP, '');
            }
            setFieldError(CURRENT_STEP, secretError);
          } else if (details.toDelete === conflict) {
            // @FIXME should we remove that part as it's not implemented in latest version ?
            const text = (
              <Trans
                i18nKey="auth:login.form.error.deletedAccount"
                values={{
                  deletionDate: moment(details.deletionDate).format(DATE_FULL),
                }}
              >
                Votre compte est en cours de suppression, vous ne pouvez donc plus vous y connecter.
                <br />
                {'Sans action de votre part il sera supprimé le {{deletionDate}}.'}
                <br />
                Si vous voulez le récupérer envoyez nous un email à&nbsp;
                <a href="mailto:question.perso@misakey.com">question.perso@misakey.com</a>
              </Trans>
            );
            enqueueSnackbar(text, { variant: 'error' });
          } else {
            log(e, 'error');
            // @FIXME It is false to assume that error must be a HTTP error
            handleHttpErrors(e);
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    [
      loginChallenge, identityId, methodName, pwdHashParams, dispatchHardPasswordChange,
      dialogOpen, onDialogClose,
      enqueueSnackbar, handleHttpErrors,
    ],
  );

  const onSubmit = useMemo(
    () => (reset ? handleResetSubmit : handleSubmit),
    [handleResetSubmit, handleSubmit, reset],
  );

  const primary = useMemo(
    () => ({
      text: t('common:next'),
    }),
    [t],
  );

  const onClearUser = useClearUser();

  const chipActions = useMemo(
    () => ({
      onDelete: onClearUser,
    }),
    [onClearUser],
  );

  if (!isNil(redirectTo)) {
    return (
      <Redirect
        to={redirectTo}
        forceRefresh
        manualRedirectPlaceholder={(
          <DefaultSplashScreen />
        )}
      />
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      validateOnChange={false}
    >
      <Box component={Form} display="flex" flexDirection="column" alignItems="center">
        <TitleWithCancelIcon onCancel={reset ? onCancelForgotPassword : null}>
          <Box
            display="flex"
            overflow="hidden"
            flexWrap="wrap"
            component={Trans}
            i18nKey={`auth:login.secret.${methodName}.title`}
          >
            <Box mr={1} display="flex" flexWrap="nowrap">Quel est le code de confirmation envoyé à </Box>
            <Box display="flex" flexWrap="nowrap">
              <ChipUser
                {...chipActions}
                {...userPublicData}
              />
              &nbsp;?
            </Box>
          </Box>
        </TitleWithCancelIcon>
        <Box justifyContent="flex-start" flexDirection="column" display="flex" width="100%">
          <SecretFormFields methodName={methodName} />
          {methodName === EMAILED_CODE && (
            <ButtonRenewAuthStep
              classes={{ buttonRoot: classes.buttonRoot }}
              loginChallenge={loginChallenge}
              authnStep={authnStep}
              text={t('auth:login.form.action.getANewCode.button')}
            />
          )}
          {methodName === PREHASHED_PASSWORD && (
            <ButtonForgotPassword
              classes={{ buttonRoot: classes.buttonRoot }}
              loginChallenge={loginChallenge}
              identifier={identifier}
              text={t('auth:login.form.action.forgotPassword')}
              onDone={onForgotPasswordDone}
            />
          )}
        </Box>
        <BoxControls
          formik
          primary={primary}
        />
        <DialogPasswordReset open={dialogOpen} onClose={onDialogClose} onSubmit={onDialogSubmit} />
      </Box>
    </Formik>
  );
};

AuthLoginSecret.propTypes = {
  identifier: PropTypes.string,
  loginChallenge: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  authnStep: SSO_PROP_TYPES.authnStep.isRequired,
  identity: SSO_PROP_TYPES.identity.isRequired,
  dispatchHardPasswordChange: PropTypes.func.isRequired,
};

AuthLoginSecret.defaultProps = {
  identifier: '',
};

// CONNECT
const mapStateToProps = (state) => ({
  authnStep: state.sso.authnStep,
  identity: state.sso.identity,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchHardPasswordChange: (newPassword) => dispatch(hardPasswordChange(newPassword)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common', 'auth'])(AuthLoginSecret));
