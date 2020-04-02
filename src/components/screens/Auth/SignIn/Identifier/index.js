import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Formik } from 'formik';

import { DEFAULT_SECLEVEL, SECLEVEL_CONFIG, STEP, INITIAL_VALUES, ERROR_KEYS } from 'constants/auth';
import API from '@misakey/api';

import { getSignInValidationSchema } from 'constants/validationSchemas/auth';
import { screenAuthSetIdentifier, screenAuthSetPublics } from 'store/actions/screens/auth';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import head from '@misakey/helpers/head';
import props from '@misakey/helpers/props';
import compose from '@misakey/helpers/compose';
import { getDetails } from '@misakey/helpers/apiError';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';
import { useIdentifierContentAction, useIdentifierSecondaryAction } from '@misakey/hooks/useActions/signIn';

import SignInFormFields from 'components/screens/Auth/SignIn/Form/Fields';
import FormCardAuth from 'components/dumb/Form/Card/Auth';
import AuthCardTitle from 'components/smart/Card/Auth/Title';
import CardHeaderAuth from 'components/smart/Card/Auth/Header';
import Button from '@misakey/ui/Button';
import LinkMore from 'components/dumb/Link/More';

// CONSTANTS
const CURRENT_STEP = STEP.identifier;

// HELPERS
const getIdentifierError = compose(
  head,
  (errors) => errors.filter((error) => !isNil(error)),
  props(ERROR_KEYS[STEP.identifier]),
);

const fetchUser = (identifier) => API
  .use(API.endpoints.user.public.read)
  .build({ email: identifier })
  .send();

// HOOKS
const useStyles = makeStyles(() => ({
  buttonRoot: {
    width: 'auto',
  },
}));

// COMPONENTS
const AuthSignInIdentifier = ({
  identifier,
  acr,
  dispatchSetIdentifier,
  dispatchSetPublics,
  error,
  t,
}) => {
  const classes = useStyles();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const secLevelConfig = useMemo(() => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL], [acr]);

  const initialValues = useMemo(
    () => ({
      ...INITIAL_VALUES[CURRENT_STEP],
      identifier,
    }),
    [identifier],
  );

  const initialTouched = useMemo(
    () => (isEmpty(error)
      ? {}
      : { identifier: true }),
    [error],
  );

  const validationSchema = useMemo(
    () => getSignInValidationSchema(secLevelConfig.fieldTypes, CURRENT_STEP),
    [secLevelConfig.fieldTypes],
  );

  const onSubmit = useCallback(
    ({ identifier: formIdentifier }, { setFieldError }) => fetchUser(formIdentifier)
      .then((response) => Promise.all([
        dispatchSetPublics(objectToCamelCase(response)),
        dispatchSetIdentifier(formIdentifier),
      ]))
      .catch((e) => {
        const details = getDetails(e);
        const identifierError = getIdentifierError(details);
        if (!isNil(identifierError)) {
          setFieldError(STEP.identifier, identifierError);
        } else {
          handleGenericHttpErrors(e);
        }
      }),
    [dispatchSetIdentifier, dispatchSetPublics, handleGenericHttpErrors],
  );


  const contentAction = useIdentifierContentAction(acr, t);

  const primary = useMemo(() => ({
    text: t('auth:signIn.form.action.next'),
  }),
  [t]);

  const secondary = useIdentifierSecondaryAction(acr);

  return (
    <Formik
      initialValues={initialValues}
      initialTouched={initialTouched}
      initialErrors={error}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      <FormCardAuth
        primary={primary}
        secondary={secondary}
        title={<AuthCardTitle name="signIn" />}
        subtitle={t('auth:signIn.card.subtitle.text.identifier.email')}
        Header={CardHeaderAuth}
        formik
      >
        <SignInFormFields acr={acr} step={CURRENT_STEP} />
        <Button classes={{ buttonRoot: classes.buttonRoot }} {...contentAction} />
        <LinkMore />
      </FormCardAuth>
    </Formik>
  );
};

AuthSignInIdentifier.propTypes = {
  identifier: PropTypes.string,
  acr: PropTypes.number,
  error: PropTypes.object,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  dispatchSetIdentifier: PropTypes.func.isRequired,
  dispatchSetPublics: PropTypes.func.isRequired,
};

AuthSignInIdentifier.defaultProps = {
  error: {},
  identifier: '',
  acr: null,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchSetIdentifier: (identifier) => dispatch(screenAuthSetIdentifier(identifier)),
  dispatchSetPublics: (publics) => dispatch(screenAuthSetPublics(publics)),
});

export default connect(null, mapDispatchToProps)(withTranslation(['auth', 'common'])(AuthSignInIdentifier));
