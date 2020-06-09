import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import moment from 'moment';

import { STEP, INITIAL_VALUES, ERROR_KEYS } from 'constants/auth';
import { getSecretValidationSchema } from 'constants/validationSchemas/auth';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { DATE_FULL } from 'constants/formats/dates';

import { EMAILED_CODE } from '@misakey/auth/constants/method';

import compose from '@misakey/helpers/compose';
import head from '@misakey/helpers/head';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import props from '@misakey/helpers/props';
import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';
import log from '@misakey/helpers/log';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useSecretContentAction, useClearUser } from '@misakey/hooks/useActions/loginSecret';
import useRenewAuthStep from '@misakey/auth/hooks/useRenewAuthStep';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Box from '@material-ui/core/Box';
import DefaultSplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import SecretFormFields from 'components/newScreens/Auth/Login/Secret/Form/Fields';
import Button from '@misakey/ui/Button';
import Redirect from 'components/dumb/Redirect';
import ChipUser from 'components/dumb/Chip/User';
import Title from 'components/dumb/Typography/Title';
import BoxControls from 'components/dumb/Box/Controls';

import loginAuthStep from '@misakey/auth/builder/loginAuthStep';

// CONSTANTS
const { conflict } = errorTypes;
const CURRENT_STEP = STEP.secret;

// HELPERS
const getSecretError = compose(
  head,
  (errors) => errors.filter((error) => !isNil(error)),
  props(ERROR_KEYS[STEP.secret]),
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
  t,
}) => {
  const theme = useTheme();
  const isXsLayout = useMediaQuery(theme.breakpoints.only('xs'));
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const [redirectTo, setRedirectTo] = useState(null);

  const initialValues = useMemo(() => INITIAL_VALUES[CURRENT_STEP], []);

  const { methodName, identityId } = useMemo(
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

  const onSubmit = useCallback(
    ({ secret }, { setFieldError, setSubmitting, setFieldValue }) => {
      setRedirectTo(null);

      const pwdHashParams = path(['argon2Params'], authnStep);

      loginAuthStep({
        loginChallenge,
        identityId,
        secret,
        methodName,
        pwdHashParams,
      })
        .then((response) => {
          const { redirectTo: nextRedirectTo } = objectToCamelCase(response);
          setRedirectTo(nextRedirectTo);
        })
        .catch((e) => {
          const details = getDetails(e);
          const secretError = getSecretError(details);
          if (!isNil(secretError)) {
            if (methodName === EMAILED_CODE) {
              setFieldValue(STEP.secret, '');
            }
            setFieldError(STEP.secret, secretError);
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
        .finally(() => { setSubmitting(false); });
    },
    [loginChallenge, identityId, methodName, authnStep, enqueueSnackbar, handleHttpErrors],
  );

  const onRenewAuthStep = useRenewAuthStep({ loginChallenge, identityId, methodName });

  const signInFormContentAction = useSecretContentAction(
    methodName, t, onRenewAuthStep,
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
        <Title>
          <Box
            display="flex"
            overflow="hidden"
            flexWrap="wrap"
            component={Trans}
            i18nKey={`auth:login.secret.${methodName}.title`}
          >
            <Box display="flex" flexWrap="nowrap">Quel est le code de confirmation envoyé à </Box>
            <Box ml={1} display="flex" flexWrap="nowrap">
              <ChipUser
                {...chipActions}
                {...userPublicData}
              />
              &nbsp;?
            </Box>
          </Box>
        </Title>
        <Box justifyContent="flex-start" flexDirection="column" display="flex" width="100%">
          <SecretFormFields methodName={methodName} />
          {!isXsLayout && (
            <Button
              classes={{ buttonRoot: classes.buttonRoot }}
              {...signInFormContentAction}
            />
          )}
        </Box>
        <BoxControls
          formik
          primary={primary}
          secondary={isXsLayout ? signInFormContentAction : null}
        />
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
};

AuthLoginSecret.defaultProps = {
  identifier: '',
};

// CONNECT
const mapStateToProps = (state) => ({
  authnStep: state.sso.authnStep,
  identity: state.sso.identity,
});

export default connect(mapStateToProps, {})(withTranslation(['common', 'auth'])(AuthLoginSecret));
