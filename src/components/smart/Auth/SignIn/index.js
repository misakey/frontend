import React from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import isNil from '@misakey/helpers/isNil';

import { FIELD_PROPTYPES } from '@misakey/ui/Form/Fields';
import Redirect from '@misakey/ui/Redirect';

import prop from '@misakey/helpers/prop';
import isEmpty from '@misakey/helpers/isEmpty';

import SignInForm from 'components/smart/Auth/SignIn/Form';
import DEFAULT_VALUES from 'components/smart/Auth/SignIn/values';
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
