import React from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';

import API from '@misakey/api';
import isNil from '@misakey/helpers/isNil';

import { FIELD_PROPTYPES } from '@misakey/ui/Form/Fields';
import DEFAULT_VALUES from 'components/smart/Auth/SignUp/Confirm/values';
import validationSchema from 'components/smart/Auth/SignUp/Confirm/validationSchema';

import SignUpConfirmForm from 'components/smart/Auth/SignUp/Confirm/Form';
import Redirect from '@misakey/ui/Redirect';

const SignUpConfirm = ({ displayCard, fields, initialValues, onSubmit }) => {
  const [redirectTo, setRedirectTo] = React.useState(null);

  function onSubmitSuccess({ email, password, challenge }) {
    return API.use(API.endpoints.auth.signIn)
      .build(undefined, { email, password, challenge })
      .send()
      .then((response) => {
        const redirection = response.redirect_to;
        if (!isNil(redirection)) {
          setRedirectTo(redirection);
        }
      });
  }

  function handleSubmit(values, actions) {
    const payload = { email: values.email, otp: values.code };
    setRedirectTo(null);

    return API.use(API.endpoints.auth.confirm)
      .build(undefined, payload)
      .send()
      .then(() => onSubmitSuccess(values, actions))
      .catch((e) => {
        actions.setSubmitting(false);
        actions.setFieldError('code', e.details.otp);
      })
      .finally(() => actions.setSubmitting(false));
  }

  if (!isNil(redirectTo)) { return <Redirect to={redirectTo} />; }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit || handleSubmit}
    >
      {(formProps) => (
        <SignUpConfirmForm
          displayCard={displayCard}
          fields={fields}
          {...formProps}
        />
      )}
    </Formik>
  );
};

SignUpConfirm.propTypes = {
  displayCard: PropTypes.bool,
  fields: PropTypes.objectOf(FIELD_PROPTYPES),
  initialValues: PropTypes.shape({ code: PropTypes.string }),
  onSubmit: PropTypes.func,
};

SignUpConfirm.defaultProps = {
  displayCard: false,
  fields: {},
  initialValues: DEFAULT_VALUES,
  onSubmit: null,
};

export default SignUpConfirm;
