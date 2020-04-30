import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import moment from 'moment';

import routes from 'routes';
import { DEFAULT_SECLEVEL, SECLEVEL_CONFIG, STEP, INITIAL_VALUES, ERROR_KEYS } from 'constants/auth';
import { getSignInValidationSchema } from 'constants/validationSchemas/auth';
import { screenAuthSetCredentials } from 'store/actions/screens/auth';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { isAuthPrepareCodeConflict, handleAuthPrepareCodeConflict } from 'constants/Errors/classes/AuthPrepareCodeConflict';
import { DATE_FULL } from 'constants/formats/dates';

import isFunction from '@misakey/helpers/isFunction';
import compose from '@misakey/helpers/compose';
import head from '@misakey/helpers/head';
import props from '@misakey/helpers/props';
import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getDetails } from '@misakey/helpers/apiError';
import log from '@misakey/helpers/log';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useSecretContentAction, useSecretSecondaryAction } from '@misakey/hooks/useActions/signIn';

import Box from '@material-ui/core/Box';
import DefaultSplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import SignInFormFields from 'components/screens/Auth/SignIn/Form/Fields';
import FormCardAuth from 'components/dumb/Form/Card/Auth';
import AuthCardTitle from 'components/smart/Card/Auth/Title';
import CardHeaderAuth from 'components/smart/Card/Auth/Header';
import Button from '@misakey/ui/Button';
import LinkMore from 'components/dumb/Link/More';
import Redirect from 'components/dumb/Redirect';
import ChipUser from 'components/dumb/Chip/User';

import fetchInitAuth from '@misakey/auth/api/initAuth';
import fetchSignIn from '@misakey/auth/api/signIn';

// CONSTANTS
const { conflict } = errorTypes;
const CURRENT_STEP = STEP.secret;

// HELPERS
const onClickProp = prop('onClick');
const handleSecretPrepareCodeConflict = handleAuthPrepareCodeConflict(STEP.secret);

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
const AuthSignInSecret = ({
  identifier,
  publicInfo,
  challenge,
  acr,
  t,
  dispatchSetCredentials,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

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

  const userPublicData = useMemo(
    () => ({ ...publicInfo, identifier }),
    [identifier, publicInfo],
  );

  const onSubmit = useCallback(
    ({ secret }, { setFieldError, setSubmitting }) => {
      setRedirectTo(null);

      const pwdHashParams = path(['argon2Params'], publicInfo);

      fetchSignIn({
        challenge,
        email: identifier,
        secret,
        acr: (acr || DEFAULT_SECLEVEL),
        pwdHashParams,
      })
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
                i18nKey="auth:signIn.form.error.deletedAccount"
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
    [
      challenge, acr, identifier, publicInfo,
      dispatchSetCredentials, enqueueSnackbar,
      handleHttpErrors,
    ],
  );

  const serverRelief = useMemo(
    () => !isEmpty(publicInfo) && !isEmpty(publicInfo.argon2Params),
    [publicInfo],
  );


  const onFetchInitAuth = useCallback(
    async () => {
      try {
        return fetchInitAuth({
          challenge,
          email: identifier,
          acr: (acr || DEFAULT_SECLEVEL),
          serverRelief,
        });
      } catch (e) {
        handleSecretPrepareCodeConflict(e);
        throw e;
      }
    },
    [challenge, identifier, acr, serverRelief],
  );

  const renewConfirmationCode = useCallback(
    () => onFetchInitAuth()
      .then(() => {
        enqueueSnackbar(t('auth:signIn.form.action.getANewCode.success'), { variant: 'success' });
      })
      .catch((error) => {
        if (isAuthPrepareCodeConflict(error)) {
          enqueueSnackbar(t('auth:signIn.form.error.conflict'), { variant: 'error' });
        } else {
          handleHttpErrors(error);
        }
      }),
    [onFetchInitAuth, enqueueSnackbar, t, handleHttpErrors],
  );

  const signInFormContentAction = useSecretContentAction(
    acr, t, renewConfirmationCode,
  );
  const primary = useMemo(
    () => ({
      text: t('auth:signIn.form.action.submit'),
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
        subtitle={t(`auth:signIn.card.subtitle.text.secret.${fieldType}`)}
        Header={CardHeaderAuth}
        formik
      >
        <Box alignItems="center" flexDirection="column" display="flex">
          <ChipUser
            {...chipActions}
            {...userPublicData}
          />
          <SignInFormFields acr={acr} step={CURRENT_STEP} />
        </Box>
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
  publicInfo: PropTypes.object,
  dispatchSetCredentials: PropTypes.func.isRequired,
};

AuthSignInSecret.defaultProps = {
  identifier: '',
  acr: null,
  publicInfo: {},
};

// CONNECT
const mapStateToProps = (state) => ({
  publicInfo: state.screens.auth.publics,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetCredentials: (identifier, secret) => dispatch(
    screenAuthSetCredentials(identifier, secret),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common', 'auth'])(AuthSignInSecret));
