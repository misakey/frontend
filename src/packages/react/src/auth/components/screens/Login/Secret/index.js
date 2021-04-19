import React, { useState, useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';

import { LARGE, APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';
import authRoutes from '@misakey/react/auth/routes';
import { NEXT_STEP_REDIRECT, AuthUndefinedMethodName } from '@misakey/core/auth/constants/step';
import { STEP, INITIAL_VALUES, ERROR_KEYS } from '@misakey/core/auth/constants';
import { getSecretValidationSchema } from '@misakey/react/auth/constants/validationSchemas';
import { WEBAUTHN, IDENTITY_PASSWORD, IDENTITY_EMAILED_CODE, TOTP, TOTP_RECOVERY } from '@misakey/core/auth/constants/amr';

import { PROP_TYPES as SSO_PROP_TYPES, selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';
import { ssoUpdate } from '@misakey/react/auth/store/actions/sso';
import createNewRootKeySharesFromAuthFlow from '@misakey/react/crypto/store/actions/createNewRootKeySharesFromAuthFlow';

import compose from '@misakey/core/helpers/compose';
import head from '@misakey/core/helpers/head';
import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';
import props from '@misakey/core/helpers/props';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import { getDetails, getCode } from '@misakey/core/helpers/apiError';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import { loginAuthStepBuilder } from '@misakey/core/auth/builder/loginAuthStep';
import { isHydraErrorCode } from '@misakey/core/auth/helpers/errors';
import { makeMetadata } from '@misakey/core/auth/helpers/method';
import computeNextAuthMethod from '@misakey/core/auth/helpers/computeNextAuthMethod';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useClearUser } from '@misakey/hooks/useActions/loginSecret';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useInitAuthStepEffect from '@misakey/react/auth/hooks/useInitAuthStep/effect';

import CardSsoWithSlope from '@misakey/react/auth/components/Card/Sso/WithSlope';
import Box from '@material-ui/core/Box';
import SecretFormField from '@misakey/react/auth/components/Form/Login/Secret';
import IdentifierHiddenFormField from '@misakey/react/auth/components/Form/Login/Identifier/Hidden';
import Redirect from '@misakey/ui/Redirect';
import TitleBold from '@misakey/ui/Typography/Title/Bold';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import TransRequireAccess from '@misakey/ui/Trans/RequireAccess';
import BoxControlsCard from '@misakey/ui/Box/Controls/Card';
import ButtonForgotPassword from '@misakey/react/auth/components/Button/ForgotPassword';
import ButtonInitAuthStep from '@misakey/react/auth/components/Button/InitAuthStep';
import ButtonForgotPasswordCancel from '@misakey/react/auth/components/Button/ForgotPassword/Cancel';
import SnackbarActionAuthRestart from '@misakey/ui/Snackbar/Action/AuthRestart';
import SnackbarActionRefresh from '@misakey/ui/Snackbar/Action/Refresh';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import AvatarClientSso from '@misakey/ui/Avatar/Client/Sso';
import Screen from '@misakey/ui/Screen';
import AppBar from '@misakey/ui/AppBar';
import CardUser from '@misakey/ui/Card/User';
import IconButton from '@material-ui/core/IconButton';
import FormHelperTextInCard from '@misakey/ui/FormHelperText/InCard';
import ButtonSwitchTotpMethod from '@misakey/react/auth/components/Button/SwitchTotpMethod';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';

const {
  authnState: authnStateSelector,
  methodName: methodNameSelector,
  methodMetadata: methodMetadataSelector,
} = ssoSelectors;

// CONSTANTS
const CURRENT_STEP = STEP.secret;
const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 120,
};

// HELPERS
const getSecretError = compose(
  head,
  (errors) => errors.filter((error) => !isNil(error)),
  props(ERROR_KEYS[CURRENT_STEP]),
);

// HOOKS
const useStyles = makeStyles(() => ({
  cardOverflowVisible: {
    overflow: 'visible',
  },
}));

// COMPONENTS
const AuthLoginSecret = ({ identifier, userPublicData, loginChallenge, client, resourceName }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation(['common', 'auth']);

  const dispatch = useDispatch();
  const authnState = useSelector(authnStateSelector);
  const methodName = useSelector(methodNameSelector);
  const methodMetadata = useSelector(methodMetadataSelector);

  const [redirectTo, setRedirectTo] = useState(null);

  const initialValues = useMemo(() => INITIAL_VALUES[CURRENT_STEP], []);

  const { identityId } = useSafeDestr(authnState);
  const { name } = useSafeDestr(client);
  const { availableAmrs } = useSafeDestr(authnState);

  const validationSchema = useMemo(
    () => getSecretValidationSchema(methodName),
    [methodName],
  );

  const showCancelForgotPassword = useMemo(
    () => methodName === IDENTITY_EMAILED_CODE && availableAmrs.includes(IDENTITY_PASSWORD),
    [availableAmrs, methodName],
  );

  const onHandleBackupSecretShares = useCallback(
    async ({ secret: password }) => {
      try {
        await dispatch(createNewRootKeySharesFromAuthFlow({
          loginChallenge,
          identityId,
          password,
        }));
      } catch (error) {
        logSentryException(error, 'AuthFlow: create new root key share', { crypto: true }, 'warning');
        enqueueSnackbar(t('common:crypto.errors.rootKeyShare'), { variant: 'warning' });
        // a failure of root key shares creation
        // should not make the entire auth flow fail
        // because it is not an essential step of the auth flow:
        // the user will simply have to enter her password one more time
      }
    },
    [dispatch, enqueueSnackbar, identityId, loginChallenge, t],
  );

  const onSuccess = useCallback(
    (res) => {
      const { state, next, redirectTo: nextRedirectTo } = objectToCamelCaseDeep(res);

      if (next === NEXT_STEP_REDIRECT) {
        return setRedirectTo(nextRedirectTo);
      }

      return dispatch(ssoUpdate({
        authnState: state,
        methodName: computeNextAuthMethod(state),
      }));
    },
    [dispatch],
  );

  const onError = useCallback(
    async (e, { setFieldValue, setFieldError }) => {
      const code = getCode(e);
      const details = getDetails(e);

      logSentryException(e, 'Auth flow: LoginAuthStep', { auth: true });

      if (e instanceof AuthUndefinedMethodName || details.loginChallenge) {
        enqueueSnackbar(t('auth:error.flow.invalid_flow'), { variant: 'warning' });
        return setRedirectTo(authRoutes.redirectToSignIn);
      }

      const secretError = getSecretError(details);

      if (!isNil(secretError)) {
        if (methodName === IDENTITY_PASSWORD) {
          setFieldValue(CURRENT_STEP, '');
        }
        return setFieldError(CURRENT_STEP, secretError);
      }

      if (isHydraErrorCode(code)) {
        return enqueueSnackbar(t(`auth:error.flow.${code}`), {
          variant: 'warning',
          action: (key) => <SnackbarActionAuthRestart id={key} />,
        });
      }

      return enqueueSnackbar(t('common:errorPleaseRetryOrRefresh'), {
        variant: 'warning',
        action: (key) => <SnackbarActionRefresh id={key} />,
      });
    },
    [enqueueSnackbar, methodName, t],
  );

  const onLoginAuthStep = useCallback(
    async (values) => {
      const metadata = await makeMetadata(methodName, { ...values, metadata: methodMetadata });
      return loginAuthStepBuilder({ loginChallenge, identityId, methodName, metadata });
    },
    [identityId, loginChallenge, methodMetadata, methodName],
  );

  const onSubmit = useCallback(
    async (values, { setFieldError, setSubmitting, setFieldValue }) => {
      setRedirectTo(null);
      try {
        const response = await onLoginAuthStep(values);
        // handle BackupSecretShares
        if (methodName === IDENTITY_PASSWORD) {
          await onHandleBackupSecretShares(values);
        }
        setFieldValue(CURRENT_STEP, '');
        onSuccess(response);
      } catch (err) {
        onError(err, { setFieldError, setFieldValue });
      } finally {
        setSubmitting(false);
      }
    },
    [methodName, onError, onHandleBackupSecretShares, onLoginAuthStep, onSuccess],
  );

  const onClearUser = useClearUser();

  const { isFetching: isFetchingMetadata } = useInitAuthStepEffect(
    loginChallenge,
    identityId,
    methodName,
    methodMetadata,
  );

  const secondary = useMemo(
    () => {
      if (methodName === IDENTITY_EMAILED_CODE) {
        return (
          <ButtonInitAuthStep
            loginChallenge={loginChallenge}
            methodName={methodName}
            identityId={identityId}
            successText={t('auth:login.form.action.getANewCode.success')}
            text={t('auth:login.form.action.getANewCode.button')}
          />
        );
      }
      if (methodName === IDENTITY_PASSWORD) {
        return (
          <ButtonForgotPassword
            text={t('auth:login.form.action.forgotPassword')}
          />
        );
      }
      if ([TOTP, TOTP_RECOVERY].includes(methodName)) {
        return (
          <ButtonSwitchTotpMethod
            methodName={methodName}
          />
        );
      }
      return null;
    },
    [identityId, loginChallenge, methodName, t],
  );

  if (!isNil(redirectTo)) {
    return (
      <Redirect
        to={redirectTo}
        forceRefresh
        manualRedirectPlaceholder={<Screen isLoading />}
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
      <Box component={Form} height="100%">
        <CardSsoWithSlope
          slopeProps={SLOPE_PROPS}
          avatar={<AvatarClientSso client={client} />}
          avatarSize={LARGE}
          header={(
            <AppBar color="primary">
              {showCancelForgotPassword ? (
                <ButtonForgotPasswordCancel
                  color="background"
                  text={t('auth:login.secret.cancelForgotPassword')}
                />
              ) : (
                <Button
                  color="background"
                  standing={BUTTON_STANDINGS.TEXT}
                  onClick={onClearUser}
                  text={(
                    <>
                      <ArrowBackIcon />
                      {t('auth:login.secret.changeAccount')}
                    </>
                  )}
                />
              )}
            </AppBar>
          )}
        >
          <Box>
            <Box display="flex" flexDirection="column">
              <TitleBold align="center" gutterBottom={false}>
                <Trans i18nKey={`auth:login.secret.${methodName}.title`} values={{ resourceName: isEmpty(resourceName) ? name : resourceName }}>
                  <span>{'{{resourceName}}'}</span>
                </Trans>
              </TitleBold>
              <Subtitle align="center">
                <TransRequireAccess i18nKey={`auth:login.secret.${methodName}.requireAccess.title`} />
              </Subtitle>
              <CardUser
                my={3}
                className={classes.cardOverflowVisible}
                action={(
                  <IconButton aria-label={t('common:signOut')} onClick={onClearUser}>
                    <CloseIcon />
                  </IconButton>
                )}
                {...userPublicData}
              >
                <IdentifierHiddenFormField value={identifier} />
                <SecretFormField
                  methodName={methodName}
                  FormHelperTextProps={{ component: FormHelperTextInCard }}
                  margin="none"
                />
              </CardUser>
              <BoxControlsCard
                mt={2}
                formik
                primary={{
                  text: t('common:next'),
                  disabled: methodName === WEBAUTHN,
                  isLoading: isFetchingMetadata,
                }}
                secondary={secondary}
              />
            </Box>
          </Box>
        </CardSsoWithSlope>
      </Box>
    </Formik>
  );
};

AuthLoginSecret.propTypes = {
  identifier: PropTypes.string,
  loginChallenge: PropTypes.string.isRequired,
  client: SSO_PROP_TYPES.client.isRequired,
  resourceName: PropTypes.string,
  identity: SSO_PROP_TYPES.identity.isRequired,
  userPublicData: PropTypes.object.isRequired,
};

AuthLoginSecret.defaultProps = {
  identifier: '',
  resourceName: '',
};

export default AuthLoginSecret;
