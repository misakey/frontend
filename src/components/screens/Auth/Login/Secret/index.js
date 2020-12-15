import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import moment from 'moment';

import routes from 'routes';
import { QUESTIONS } from 'constants/emails';
import { NEXT_STEP_REDIRECT, NEXT_STEP_AUTH } from '@misakey/auth/constants/step';
import { STEP, INITIAL_VALUES } from '@misakey/auth/constants';
import { ERROR_KEYS } from 'constants/auth';
import { getSecretValidationSchema } from 'constants/validationSchemas/auth';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';
import hardPasswordChange from '@misakey/crypto/store/actions/hardPasswordChange';
import createNewOwnerSecrets from '@misakey/crypto/store/actions/createNewOwnerSecrets';
import createNewBackupKeySharesFromAuthFlow from '@misakey/crypto/store/actions/createNewBackupKeySharesFromAuthFlow';
import { ssoUpdate, ssoSign, ssoReset } from '@misakey/auth/store/actions/sso';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { DATE_FULL } from 'constants/formats/dates';
import { EMAILED_CODE, PREHASHED_PASSWORD, PASSWORD_RESET_KEY, ACCOUNT_CREATION, AuthUndefinedMethodName } from '@misakey/auth/constants/method';

import compose from '@misakey/helpers/compose';
import head from '@misakey/helpers/head';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import props from '@misakey/helpers/props';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getDetails, getCode } from '@misakey/helpers/apiError';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import loginAuthStep from '@misakey/auth/builder/loginAuthStep';
import { isHydraErrorCode } from '@misakey/auth/helpers/errors';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useCancelForgotPassword from '@misakey/auth/hooks/useCancelForgotPassword';
import { useClearUser } from '@misakey/hooks/useActions/loginSecret';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import CardSso from '@misakey/auth/components/Card/Sso';
import Box from '@material-ui/core/Box';
import SecretFormField from '@misakey/ui/Form/Field/Login/Secret';
import Redirect from '@misakey/ui/Redirect';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import TransRequireAccess from '@misakey/ui/Trans/RequireAccess';
import BoxControls from '@misakey/ui/Box/Controls';
import ButtonForgotPassword from '@misakey/auth/components/Button/ForgotPassword';
import ButtonRenewAuthStep from '@misakey/auth/components/Button/RenewAuthStep';
import DialogPasswordReset from 'components/smart/Dialog/Password/Reset';
import SnackbarActionAuthRestart from 'components/dumb/Snackbar/Action/AuthRestart';
import SnackbarActionRefresh from 'components/dumb/Snackbar/Action/Refresh';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import AvatarClientSso from '@misakey/ui/Avatar/Client/Sso';
import Screen from '@misakey/ui/Screen';
import AppBar from '@misakey/ui/AppBar';
import CardUser from '@misakey/ui/Card/User';
import IconButton from '@material-ui/core/IconButton';
import FormHelperTextInCard from '@misakey/ui/FormHelperText/InCard';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';

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
const useStyles = makeStyles((theme) => ({
  buttonRoot: {
    width: 'auto',
  },
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardOverflowVisible: {
    overflow: 'visible',
  },
  appBarButton: {
    color: theme.palette.background.default,
    '&:hover': {
      backgroundColor: theme.palette.reverse.action.hover,
    },
  },
}));


// COMPONENTS
const AuthLoginSecret = ({
  identifier,
  authnStep,
  identity,
  loginChallenge,
  client,
  accessToken,
  resourceName,
  dispatchHardPasswordChange,
  dispatchCreateNewOwnerSecrets,
  dispatchSsoUpdate,
  dispatchSsoSign,
  dispatchSsoReset,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const cancelForgotPassword = useCancelForgotPassword();
  const dispatch = useDispatch();

  const [redirectTo, setRedirectTo] = useState(null);
  const authIdentifierTo = useGeneratePathKeepingSearchAndHash(routes.auth.signIn._);

  const [reset, setReset] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const initialValues = useMemo(() => INITIAL_VALUES[CURRENT_STEP], []);

  const { methodName, identityId, metadata: pwdHashParams } = useSafeDestr(authnStep);
  const { name } = useSafeDestr(client);

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
    async (values, { setFieldError, setSubmitting, setFieldValue }) => {
      setRedirectTo(null);

      try {
        const response = await loginAuthStep({
          loginChallenge,
          identityId,
          methodName,
          pwdHashParams,
          dispatchHardPasswordChange,
          dispatchCreateNewOwnerSecrets,
          ...values,
          auth: !isNil(accessToken),
        }, accessToken);

        const {
          redirectTo: nextRedirectTo,
          next,
          accessToken: nextAccessToken,
          authnStep: nextAuthnStep,
        } = objectToCamelCase(response);

        await Promise.resolve(dispatchSsoSign(nextAccessToken));

        // handle BackupSecretShares
        const { secret: password, [PASSWORD_RESET_KEY]: newPassword } = values;
        const isResetPassword = methodName === EMAILED_CODE && !isNil(newPassword);
        if (isResetPassword || [PREHASHED_PASSWORD, ACCOUNT_CREATION].includes(methodName)) {
          try {
            await dispatch(createNewBackupKeySharesFromAuthFlow({
              loginChallenge,
              identityId,
              password: newPassword || password,
            }, nextAccessToken));
          } catch (error) {
            logSentryException(error, 'AuthFlow: create new backup key share', { crypto: true }, 'warning');
            enqueueSnackbar(t('common:crypto.errors.backupKeyShare'), { variant: 'warning' });
            // a failure of backup key shares creation
            // should not make the entire auth flow fail
            // because it is not an essential step of the auth flow:
            // the user will simply have to enter her password one more time
          }
        }

        if (next === NEXT_STEP_REDIRECT) {
          return setRedirectTo(nextRedirectTo);
        }
        if (next === NEXT_STEP_AUTH) {
          setFieldValue(CURRENT_STEP, '');
          return dispatchSsoUpdate({ authnStep: objectToCamelCase(nextAuthnStep) });
        }
        return response;
      } catch (e) {
        if (e instanceof AuthUndefinedMethodName) {
          enqueueSnackbar(t('auth:error.flow.invalid_flow'), { variant: 'error' });
          return setRedirectTo(routes.auth.redirectToSignIn);
        }

        // in case reset password dialog is open, close dialog before setting field error
        if (dialogOpen) {
          onDialogClose();
        }
        const code = getCode(e);
        const details = getDetails(e);
        const secretError = getSecretError(details);
        if (!isNil(secretError)) {
          if (methodName === EMAILED_CODE) {
            setFieldValue(CURRENT_STEP, '');
          }
          return setFieldError(CURRENT_STEP, secretError);
        }
        if (details.Authorization && details.loginChallenge) {
          enqueueSnackbar(t('auth:login.form.error.authorizationChallenge'), { variant: 'warning' });
          await dispatchSsoReset();
          setRedirectTo(routes.auth.redirectToSignIn);
        }
        if (isHydraErrorCode(code)) {
          return enqueueSnackbar(t(`auth:error.flow.${code}`), {
            variant: 'warning',
            action: (key) => <SnackbarActionAuthRestart id={key} />,
          });
        }
        if (details.toDelete === conflict) {
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
              <a href={`mailto:${QUESTIONS}`}>{QUESTIONS}</a>
            </Trans>
          );
          return enqueueSnackbar(text, { variant: 'error' });
        }

        logSentryException(e, 'Auth flow: LoginAuthStep', { auth: true });

        if (!isNil(e.status)) {
          // @FIXME It is false to assume that error must be a HTTP error
          return handleHttpErrors(e);
        }
        return enqueueSnackbar(t('common:errorPleaseRetryOrRefresh'), {
          variant: 'error',
          action: (key) => <SnackbarActionRefresh id={key} />,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [loginChallenge, identityId, methodName, pwdHashParams, dispatchHardPasswordChange,
      dispatchCreateNewOwnerSecrets, accessToken, dispatchSsoSign, dispatch,
      dispatchSsoUpdate, dialogOpen, onDialogClose, enqueueSnackbar, t, dispatchSsoReset,
      handleHttpErrors],
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

  if (!isNil(redirectTo)) {
    return (
      <Redirect
        to={redirectTo}
        forceRefresh
        manualRedirectPlaceholder={(
          <Screen isLoading />
        )}
      />
    );
  }

  if (isNil(methodName)) {
    return (
      <Redirect
        to={authIdentifierTo}
      />
    );
  }

  return (
    <CardSso
      avatar={<AvatarClientSso client={client} />}
      avatarLarge
      header={(
        <AppBar color="primary">
          {reset && (
          <IconButtonAppBar
            className={classes.appBarButton}
            edge="start"
            aria-label={t('common:cancel')}
            onClick={onCancelForgotPassword}
          >
            <ArrowBackIcon />
          </IconButtonAppBar>
          )}
        </AppBar>
      )}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        validateOnChange={false}
      >
        <Form>
          <Box>
            <Box display="flex" flexDirection="column">
              <Title align="center" gutterBottom={false}>
                <Trans i18nKey={`auth:login.secret.${methodName}.title`} values={{ resourceName: isEmpty(resourceName) ? name : resourceName }}>
                  <span className={classes.boldTitle}>{'{{resourceName}}'}</span>
                </Trans>
              </Title>
              <Subtitle align="center">
                <TransRequireAccess i18nKey={`auth:login.secret.${methodName}.requireAccess.title`} />
              </Subtitle>
              <CardUser
                my={3}
                className={classes.cardOverflowVisible}
                action={methodName !== ACCOUNT_CREATION && (
                  <IconButton aria-label={t('common:signOut')} onClick={onClearUser}>
                    <CloseIcon />
                  </IconButton>
                )}
                {...userPublicData}
              >
                <SecretFormField
                  methodName={methodName}
                  FormHelperTextProps={{ component: FormHelperTextInCard }}
                  margin="none"
                  centered
                />
              </CardUser>
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
              <BoxControls
                formik
                primary={primary}
              />
            </Box>
            <DialogPasswordReset
              open={dialogOpen}
              onClose={onDialogClose}
              onSubmit={onDialogSubmit}
            />
          </Box>
        </Form>
      </Formik>
    </CardSso>
  );
};

AuthLoginSecret.propTypes = {
  identifier: PropTypes.string,
  loginChallenge: PropTypes.string.isRequired,
  client: SSO_PROP_TYPES.client.isRequired,
  resourceName: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  authnStep: SSO_PROP_TYPES.authnStep.isRequired,
  identity: SSO_PROP_TYPES.identity.isRequired,
  accessToken: SSO_PROP_TYPES.accessToken,
  dispatchHardPasswordChange: PropTypes.func.isRequired,
  dispatchCreateNewOwnerSecrets: PropTypes.func.isRequired,
  dispatchSsoUpdate: PropTypes.func.isRequired,
  dispatchSsoSign: PropTypes.func.isRequired,
  dispatchSsoReset: PropTypes.func.isRequired,
};

AuthLoginSecret.defaultProps = {
  identifier: '',
  accessToken: null,
  resourceName: '',
};

// CONNECT
const mapStateToProps = (state) => ({
  authnStep: state.sso.authnStep,
  identity: state.sso.identity,
  accessToken: state.sso.accessToken,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchHardPasswordChange: (newPassword) => Promise.resolve(
    dispatch(hardPasswordChange(newPassword)),
  ),
  dispatchCreateNewOwnerSecrets: (password) => Promise.resolve(
    dispatch(createNewOwnerSecrets(password)),
  ),
  dispatchSsoUpdate: (sso) => Promise.resolve(
    dispatch(ssoUpdate(sso)),
  ),
  dispatchSsoSign: (accessToken) => Promise.resolve(
    dispatch(ssoSign(accessToken)),
  ),
  dispatchSsoReset: () => Promise.resolve(
    dispatch(ssoReset()),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common', 'auth'])(AuthLoginSecret));
