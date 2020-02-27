import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import moment from 'moment';

import API from '@misakey/api';
import routes from 'routes';
import { DEFAULT_SECLEVEL, SECLEVEL_CONFIG, STEP, INITIAL_VALUES, ERROR_KEYS } from 'constants/auth';
import { getSignInValidationSchema } from 'constants/validationSchemas/auth';
import { screenAuthSetCredentials } from 'store/actions/screens/auth';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { isAuthPrepareCodeConflict, handleAuthPrepareCodeConflict } from 'constants/Errors/classes/AuthPrepareCodeConflict';

import mapValues from '@misakey/helpers/mapValues';
import isFunction from '@misakey/helpers/isFunction';
import compose from '@misakey/helpers/compose';
import head from '@misakey/helpers/head';
import props from '@misakey/helpers/props';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';
import { useSecretContentAction, useSecretSecondaryAction } from '@misakey/hooks/useActions/signIn';

import Box from '@material-ui/core/Box';
import DefaultSplashScreen from '@misakey/ui/Screen/Splash';
import SignInFormFields from 'components/screens/Auth/SignIn/Form/Fields';
import FormCardAuth from 'components/dumb/Form/Card/Auth';
import AuthCardTitle from 'components/smart/Card/Auth/Title';
import CardHeaderAuth from 'components/smart/Card/Auth/Header';
import Button from 'components/dumb/Button';
import LinkMore from 'components/dumb/Link/More';
import Redirect from 'components/dumb/Redirect';
import ChipUser from 'components/dumb/Chip/User';

// CONSTANTS
const { conflict } = errorTypes;
const CURRENT_STEP = STEP.secret;

const INIT_AUTH_ENDPOINT = {
  method: 'POST',
  path: '/login/method',
};

// HELPERS
const onClickProp = prop('onClick');
const handleSecretPrepareCodeConflict = handleAuthPrepareCodeConflict(STEP.secret);

const getSecretError = compose(
  head,
  (errors) => errors.filter((error) => !isNil(error)),
  props(ERROR_KEYS[STEP.secret]),
);

const fetchInitAuth = (challenge, identifier, secret) => API
  .use(INIT_AUTH_ENDPOINT)
  .build(null, {
    challenge,
    identifier,
    secret,
  })
  .send();

const fetchSignIn = (payload, challenge) => API
  .use(API.endpoints.auth.signIn)
  .build(undefined, { ...payload, challenge })
  .send();

// HOOKS
const useStyles = makeStyles(() => ({
  buttonRoot: {
    width: 'auto',
  },
}));


// COMPONENTS
const AuthSignInSecret = ({
  identifier,
  publics,
  challenge,
  acr,
  t,
  dispatchSetCredentials,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const [redirectTo, setRedirectTo] = useState(null);

  const secLevel = useMemo(
    () => acr || DEFAULT_SECLEVEL,
    [acr],
  );
  const secLevelConfig = useMemo(() => SECLEVEL_CONFIG[secLevel], [secLevel]);
  const initialValues = useMemo(() => INITIAL_VALUES[CURRENT_STEP], []);
  const fieldType = useMemo(() => SECLEVEL_CONFIG[secLevel].fieldTypes[STEP.secret], [secLevel]);

  const validationSchema = useMemo(
    () => getSignInValidationSchema(secLevelConfig.fieldTypes, CURRENT_STEP),
    [secLevelConfig.fieldTypes],
  );

  const authIdentifier = useMemo(
    () => ({
      kind: secLevelConfig.api.identifier.kind,
      value: identifier,
    }),
    [identifier, secLevelConfig.api.identifier.kind],
  );

  const authSecret = useMemo(
    () => ({
      kind: secLevelConfig.api.secret.kind,
    }),
    [secLevelConfig.api.secret.kind],
  );

  const userPublicData = useMemo(
    () => ({ ...publics, identifier }),
    [identifier, publics],
  );

  const onSubmit = useCallback(
    ({ secret }, { setFieldError, setSubmitting }) => {
      const payload = mapValues({ secret, identifier }, (value, key) => ({
        kind: secLevelConfig.api[key].kind,
        value: isFunction(secLevelConfig.api[key].formatValue)
          ? secLevelConfig.api[key].formatValue(value)
          : value,
      }));
      setRedirectTo(null);

      fetchSignIn(payload, challenge)
        .then((response) => {
          const redirection = response.redirect_to;
          if (!isNil(redirection)) { setRedirectTo(redirection); }
        })
        .catch((e) => {
          const details = getDetails(e);
          const secretError = getSecretError(details);
          if (!isNil(secretError)) {
            setFieldError(STEP.secret, secretError);
          } else if (details.confirmed === conflict) {
            dispatchSetCredentials(identifier, secret);
            setRedirectTo(routes.auth.signUp.confirm);
          } else if (details.toDelete === conflict) {
            const text = (
              <Trans
                i18nKey="auth__new:signIn.form.error.deletedAccount"
                values={{ deletionDate: moment(details.deletionDate).format('LL') }}
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
            handleGenericHttpErrors(e);
          }
        })
        .finally(() => { setSubmitting(false); });
    },
    [
      challenge, dispatchSetCredentials, enqueueSnackbar,
      handleGenericHttpErrors, identifier, secLevelConfig,
    ],
  );

  const onFetchInitAuth = useCallback(
    () => fetchInitAuth(challenge, authIdentifier, authSecret)
      .catch((e) => {
        handleSecretPrepareCodeConflict(e);
        throw e;
      }),
    [authIdentifier, authSecret, challenge],
  );

  const renewConfirmationCode = useCallback(
    () => onFetchInitAuth()
      .then(() => {
        enqueueSnackbar(t('auth__new:signIn.form.action.getANewCode.success'), { variant: 'success' });
      })
      .catch((error) => {
        if (isAuthPrepareCodeConflict(error)) {
          enqueueSnackbar(t('auth__new:signIn.form.error.conflict'), { variant: 'error' });
        } else {
          handleGenericHttpErrors(error);
        }
      }),
    [onFetchInitAuth, enqueueSnackbar, t, handleGenericHttpErrors],
  );

  const signInFormContentAction = useSecretContentAction(
    acr, t, renewConfirmationCode,
  );
  const primary = useMemo(
    () => ({
      text: t('auth__new:signIn.form.action.submit'),
    }),
    [t],
  );

  const secondary = useSecretSecondaryAction(acr, t);

  const chipActions = useMemo(
    () => {
      const onClick = onClickProp(secondary);
      return isFunction(onClick)
        ? {
          onClick,
          onDelete: onClick,
        }
        : {};
    },
    [secondary],
  );

  if (!isNil(redirectTo)) {
    return (
      <Redirect
        to={redirectTo}
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
    >
      <FormCardAuth
        primary={primary}
        secondary={secondary}
        title={<AuthCardTitle name="signIn" />}
        subtitle={t(`auth__new:signIn.card.subtitle.text.secret.${fieldType}`)}
        Header={CardHeaderAuth}
        formik
      >
        <Box textAlign="center">
          <ChipUser
            {...chipActions}
            {...userPublicData}
          />
        </Box>
        <SignInFormFields acr={acr} step={CURRENT_STEP} />
        <Button classes={{ buttonRoot: classes.buttonRoot }} {...signInFormContentAction} />
        <LinkMore />
      </FormCardAuth>
    </Formik>
  );
};

AuthSignInSecret.propTypes = {
  identifier: PropTypes.string,
  acr: PropTypes.number,
  challenge: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  publics: PropTypes.object,
  dispatchSetCredentials: PropTypes.func.isRequired,
};

AuthSignInSecret.defaultProps = {
  identifier: '',
  acr: null,
  publics: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  publics: state.screens.auth.publics,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetCredentials: (identifier, secret) => dispatch(
    screenAuthSetCredentials(identifier, secret),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common__new', 'auth__new'])(AuthSignInSecret));
