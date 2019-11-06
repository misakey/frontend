import React from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import { FIELD_PROPTYPES } from '@misakey/ui/Form/Fields';

import routes from 'routes';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isEmpty from '@misakey/helpers/isEmpty';
import { ownerCryptoContext as crypto } from '@misakey/crypto';

import { screenAuthSetCredentials } from 'store/actions/screens/auth';

import SignUpForm from 'components/smart/Auth/SignUp/Form';
import DEFAULT_VALUES from 'components/smart/Auth/SignUp/values';
import { signUpValidationSchema } from 'constants/validationSchemas/auth';

const SignUp = ({ dispatch, displayCard, fields, history, initialValues, onSubmit, t }) => {
  const { enqueueSnackbar } = useSnackbar();

  function afterCrypto({ email, password, handle, ...rest }, actions) {
    const payload = objectToSnakeCase({ email, password, displayName: handle, handle, ...rest });
    dispatch(screenAuthSetCredentials(email, password));

    API.use(API.endpoints.auth.signUp)
      .build(undefined, payload)
      .send()
      .then(() => { history.push(routes.auth.signUp.confirm); })
      .catch((e) => {
        actions.setErrors(e.details);
        actions.setSubmitting(false);

        if (isEmpty(e.details)) {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        }
      });
  }

  async function handleSubmit(values, actions) {
    const { password } = values;
    const { backupData, pubkeyData } = await crypto.createNewOwnerSecrets(password);
    // @FIXME do we really need a separate function "afterCrypto"?
    afterCrypto({ ...values, pubkeyData, backupData }, actions);
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={signUpValidationSchema}
      onSubmit={onSubmit || handleSubmit}
    >
      {(formProps) => <SignUpForm displayCard={displayCard} fields={fields} {...formProps} />}
    </Formik>
  );
};

SignUp.propTypes = {
  dispatch: PropTypes.func.isRequired,
  displayCard: PropTypes.bool,
  fields: PropTypes.objectOf(FIELD_PROPTYPES),
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  initialValues: PropTypes.shape({
    handle: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
  }),
  onSubmit: PropTypes.func,
  t: PropTypes.func.isRequired,
};

SignUp.defaultProps = {
  displayCard: false,
  fields: {},
  initialValues: DEFAULT_VALUES,
  onSubmit: null,
};

export default connect()(
  withTranslation(['common', 'auth'])(
    withRouter(SignUp),
  ),
);
