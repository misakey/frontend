import React, { useMemo } from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import { screenAuthSetEmail } from 'store/actions/screens/auth';

import { FIELD_PROPTYPES } from '@misakey/ui/Form/Fields';
import { handleApiErrors } from 'components/smart/Auth/SignIn/validationSchema';

import FormCard from '@misakey/ui/Form/Card';
import AuthCardTitle from 'components/smart/Auth/Card/Title';
import AuthCardSubTitle from 'components/smart/Auth/Card/SubTitle';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isEmpty from '@misakey/helpers/isEmpty';

import SignInFormFields from 'components/smart/Auth/SignIn/Form/Fields';
import SignInFormActions from 'components/smart/Auth/SignIn/Form/Actions';
import SignInCardContent from 'components/smart/Auth/SignIn/Form/CardContent';

import { STEP } from 'components/smart/Auth/SignIn/Form/constants';

// HOOKS
// @FIXME: better not use "value check" inside form but make profit of formik's validation
const useDisableNext = (values, errors, isValid, isSubmitting, step) => useMemo(
  () => (
    step === STEP.email
      ? Boolean(isEmpty(values.email) || errors.email || isSubmitting)
      : Boolean(!isValid || isSubmitting)),
  [values, errors, isValid, isSubmitting, step],
);

const SignInForm = ({ dispatch, displayCard, fields, t, ...formProps }) => {
  const { enqueueSnackbar } = useSnackbar();

  const { isValid, errors, isSubmitting, values, setTouched } = formProps;
  const [step, setStep] = React.useState(STEP.email);

  const disableNext = useDisableNext(values, errors, isValid, isSubmitting, step);
  const [userPublicData, setUserPublicData] = React.useState({ email: values.email });

  function fetchUser(onSuccess) {
    formProps.setSubmitting(true);

    API.use(API.endpoints.user.public.read)
      .build(values)
      .send()
      .then((response) => {
        setUserPublicData(objectToCamelCase(response));
        onSuccess();
      })
      .catch((e) => {
        const response = handleApiErrors(e);
        formProps.setErrors(response.fields);

        if (response.error && isEmpty(response.fields)) {
          const text = t(response.error);
          enqueueSnackbar(text, { variant: 'error' });
        }
      })
      .finally(() => formProps.setSubmitting(false));
  }

  function handlePrevious() { setStep(STEP.email); }
  function handleNext() {
    dispatch(screenAuthSetEmail(values.email));
    fetchUser(() => setStep(STEP.password));
  }
  function handleEmailKeyPress(event) {
    if (event.key === 'Enter' && !disableNext) {
      event.preventDefault();
      handleNext();
      // @FIXME: this is a hotfix to create same behaviour as clicking on form button
      setTouched({ email: true });
    }
  }

  const newFields = {
    ...fields,
    email: { onKeyPress: handleEmailKeyPress, ...fields.email },
  };

  const Fields = <SignInFormFields {...newFields} step={step} />;
  const Actions = (
    <SignInFormActions
      disableNext={disableNext}
      onNext={handleNext}
      step={step}
      {...formProps}
    />
  );

  const Card = displayCard && (
    <FormCard
      actions={Actions}
      title={<AuthCardTitle name="signIn" />}
      subtitle={<AuthCardSubTitle name="signIn" />}
    >
      <SignInCardContent
        fields={Fields}
        handlePrevious={handlePrevious}
        step={step}
        userPublicData={userPublicData}
        values={values}
      />
    </FormCard>
  );

  return Card || (
    <Form>
      {Fields}
      {Actions}
    </Form>
  );
};

SignInForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  displayCard: PropTypes.bool,
  errors: PropTypes.objectOf(PropTypes.string),
  fields: PropTypes.objectOf(FIELD_PROPTYPES),
  isSubmitting: PropTypes.bool.isRequired,
  setTouched: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  values: PropTypes.objectOf(PropTypes.any),
  t: PropTypes.func.isRequired,
};

SignInForm.defaultProps = {
  displayCard: false,
  fields: {},
};

export default connect()(withTranslation()(SignInForm));
