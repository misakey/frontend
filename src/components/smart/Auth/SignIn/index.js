import React, { useCallback, useMemo } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';

import * as moment from 'moment';

import API from '@misakey/api';
import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';

import mapValues from '@misakey/helpers/mapValues';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import { FIELD_PROPTYPES } from 'components/dumb/Form/Fields';
import Redirect from 'components/dumb/Redirect';

import prop from '@misakey/helpers/prop';
import isEmpty from '@misakey/helpers/isEmpty';
import isFunction from '@misakey/helpers/isFunction';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import SignInForm from 'components/smart/Auth/SignIn/Form';
import DEFAULT_VALUES from 'components/smart/Auth/SignIn/values.json';
import { getSignInValidationSchema } from 'constants/validationSchemas/auth';
import routes from 'routes';
import { screenAuthSetCredentials } from 'store/actions/screens/auth';
import { SECLEVEL_CONFIG, DEFAULT_SECLEVEL, STEP } from 'components/smart/Auth/SignIn/Form/constants';
import errorTypes from 'constants/errorTypes';
import { handleLoginApiErrors } from 'components/smart/Auth/SignIn/helpers';

import { DefaultSplashScreen } from 'components/dumb/Screen';

const { conflict, required, forbidden } = errorTypes;

// HELPERS
const getIdentifier = prop('identifier');
const isInitialValid = ({ initialValues }) => !isEmpty(getIdentifier(initialValues));

// CONSTANTS
const INIT_AUTH_ENDPOINT = {
  method: 'POST',
  path: '/login/method',
};

const useInitAuth = (
  challenge, dispatch, secLevelConfig, setRedirectTo, handleGenericHttpErrors,
) => useCallback((values, formProps, onSuccess, onError) => API
  .use(INIT_AUTH_ENDPOINT)
  .build(null, {
    challenge,
    identifier: {
      kind: secLevelConfig.api.identifier.kind,
      value: values.identifier,
    },
    secret: {
      kind: secLevelConfig.api.secret.kind,
    },
  })
  .send()
  .then(() => { if (isFunction(onSuccess)) { onSuccess(); } })
  .catch((e) => {
    if (isObject(e.details)) {
      const { code } = e;
      const { channel, userId, renewalDate, password } = objectToCamelCase(e.details);
      if (code === conflict) {
        if ((channel === conflict && userId === conflict) || renewalDate) {
          formProps.setStatus({ [STEP.secret]: conflict });
          formProps.setFieldTouched([STEP.secret], false);
        }
      } else if (code === forbidden && password === required) {
        formProps.setStatus({ [STEP.identifier]: 'seclevel_insufficient' });
        formProps.setFieldTouched([STEP.identifier], false);
      } else {
        handleLoginApiErrors(e, formProps);
      }
    }

    if (isEmpty(e.details)) {
      handleGenericHttpErrors(e);
    } else if (e.details.confirmed === conflict) {
      dispatch(screenAuthSetCredentials(values.identifier, values.secret));
      setRedirectTo(routes.auth.signUp.confirm);
    }
    if (isFunction(onError)) { onError(e); }
  }), [challenge, dispatch, secLevelConfig, setRedirectTo, handleGenericHttpErrors]);

const useHandleSubmitErrors = (
  enqueueSnackbar,
  dispatch,
  setRedirectTo,
  handleGenericHttpErrors,
) => useCallback(
  (e, values, formProps) => {
    if (isObject(e.details)) {
      if (!handleLoginApiErrors(e, formProps)) {
        const details = objectToCamelCase(prop('details', e));
        if (details.confirmed === conflict) {
          dispatch(screenAuthSetCredentials(values.identifier, values.secret));
          setRedirectTo(routes.auth.signUp.confirm);
        } else if (details.toDelete === conflict) {
          const text = (
            <Trans
              i18nKey="auth:signIn.form.error.deletedAccount"
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
      }
    } else {
      handleGenericHttpErrors(e);
    }
  },
  [dispatch, enqueueSnackbar, setRedirectTo, handleGenericHttpErrors],
);

const SignIn = ({ challenge, dispatch, displayCard, fields, acr, initialValues, onSubmit }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [redirectTo, setRedirectTo] = React.useState(null);
  const secLevelConfig = useMemo(() => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL], [acr]);
  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const handleSubmitErrors = useHandleSubmitErrors(
    enqueueSnackbar, dispatch, setRedirectTo, handleGenericHttpErrors,
  );
  const initAuth = useInitAuth(
    challenge, dispatch, secLevelConfig, setRedirectTo, handleGenericHttpErrors,
  );
  const validationSchema = useMemo(
    () => getSignInValidationSchema(secLevelConfig.fieldTypes),
    [secLevelConfig],
  );

  const handleSubmit = useCallback((values, actions) => {
    const payload = mapValues(values, (value, key) => ({
      kind: secLevelConfig.api[key].kind,
      value: isFunction(secLevelConfig.api[key].formatValue)
        ? secLevelConfig.api[key].formatValue(value)
        : value,
    }));
    setRedirectTo(null);

    API.use(API.endpoints.auth.signIn)
      .build(undefined, { ...payload, challenge })
      .send()
      .then((response) => {
        const redirection = response.redirect_to;
        if (!isNil(redirection)) { setRedirectTo(redirection); }
      })
      .catch((e) => { handleSubmitErrors(e, values, actions); })
      .finally(() => actions.setSubmitting(false));
  }, [challenge, handleSubmitErrors, secLevelConfig.api]);

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
      isInitialValid={isInitialValid}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit || handleSubmit}
    >
      {(formProps) => (
        <SignInForm
          displayCard={displayCard}
          fields={fields}
          initAuth={initAuth}
          initialStep={!isEmpty(initialValues.identifier) ? STEP.secret : null}
          {...formProps}
        />
      )}
    </Formik>
  );
};

SignIn.propTypes = {
  challenge: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  displayCard: PropTypes.bool,
  acr: PropTypes.number,
  fields: PropTypes.objectOf(FIELD_PROPTYPES),
  initialValues: PropTypes.shape({
    identifier: PropTypes.string,
    secret: PropTypes.string,
  }),
  onSubmit: PropTypes.func,
};

SignIn.defaultProps = {
  displayCard: false,
  acr: null,
  fields: {},
  initialValues: DEFAULT_VALUES,
  onSubmit: null,
};

export default connect((state) => ({ acr: state.sso.acr }))(withTranslation()(SignIn));
