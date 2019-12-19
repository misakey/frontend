import React from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';

import * as moment from 'moment';

import API from '@misakey/api';
import isNil from '@misakey/helpers/isNil';

import { FIELD_PROPTYPES } from 'components/dumb/Form/Fields';
import Redirect from 'components/dumb/Redirect';

import prop from '@misakey/helpers/prop';
import isEmpty from '@misakey/helpers/isEmpty';

import SignInForm from 'components/smart/Auth/SignIn/Form';
import DEFAULT_VALUES from 'components/smart/Auth/SignIn/values.json';
import { signInValidationSchema } from 'constants/validationSchemas/auth';
import routes from 'routes';
import { screenAuthSetCredentials } from 'store/actions/screens/auth';

// HELPERS
const getEmail = prop('email');
const isInitialValid = ({ initialValues }) => !isEmpty(getEmail(initialValues));

const SignIn = ({ challenge, dispatch, displayCard, fields, initialValues, onSubmit, t }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [redirectTo, setRedirectTo] = React.useState(null);

  function handleSubmit(values, actions) {
    const payload = { ...values, challenge };
    setRedirectTo(null);

    API.use(API.endpoints.auth.signIn)
      .build(undefined, payload)
      .send()
      .then((response) => {
        const redirection = response.redirect_to;
        if (!isNil(redirection)) { setRedirectTo(redirection); }
      })
      .catch((e) => {
        actions.setErrors(e.details);

        if (isEmpty(e.details)) {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        } else if (e.details.confirmed === 'conflict') {
          dispatch(screenAuthSetCredentials(values.email, values.password));
          setRedirectTo(routes.auth.signUp.confirm);
        } else if (e.details.to_delete === 'conflict') {
          const text = (
            <Trans
              i18nKey="auth:signIn.form.error.deletedAccount"
              values={{ deletionDate: moment.parseZone(e.details.deletion_date).format('LL') }}
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
        }
      })
      .finally(() => actions.setSubmitting(false));
  }

  if (!isNil(redirectTo)) { return <Redirect to={redirectTo} />; }

  return (
    <Formik
      isInitialValid={isInitialValid}
      initialValues={initialValues}
      validationSchema={signInValidationSchema}
      onSubmit={onSubmit || handleSubmit}
    >
      {(formProps) => <SignInForm displayCard={displayCard} {...formProps} fields={fields} />}
    </Formik>
  );
};

SignIn.propTypes = {
  challenge: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  displayCard: PropTypes.bool,
  fields: PropTypes.objectOf(FIELD_PROPTYPES),
  initialValues: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
  }),
  onSubmit: PropTypes.func,
  t: PropTypes.func.isRequired,
};

SignIn.defaultProps = {
  displayCard: false,
  fields: {},
  initialValues: DEFAULT_VALUES,
  onSubmit: null,
};

export default connect()(withTranslation()(SignIn));
