import React, { useMemo, useCallback, useEffect } from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import { screenAuthSetIdentifier } from 'store/actions/screens/auth';

import { FIELD_PROPTYPES } from 'components/dumb/Form/Fields';

import FormCard from 'components/dumb/Form/Card';
import AuthCardTitle from 'components/smart/Auth/Card/Title';
import AuthCardSubTitle from 'components/smart/Auth/Card/SubTitle';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isEmpty from '@misakey/helpers/isEmpty';

import SignInFormFields from 'components/smart/Auth/SignIn/Form/Fields';
import SignInFormActions, { useSignInFormPrimaryAction, useSignInFormSecondaryAction } from 'components/smart/Auth/SignIn/Form/Actions';
import SignInCardContent from 'components/smart/Auth/SignIn/Form/CardContent';

import errorTypes from 'constants/errorTypes';

import { STEP, DEFAULT_SECLEVEL, SECLEVEL_CONFIG } from 'components/smart/Auth/SignIn/Form/constants';
import { handleLoginApiErrors, getApiErrors } from 'components/smart/Auth/SignIn/helpers';

const { conflict, required } = errorTypes;

// HELPERS
const handleApiErrors = (e) => ({
  error: `httpStatus.error.${API.errors.filter(e.httpStatus)}`,
  fields: e.details,
});

// HOOKS
// @FIXME: better not use "value check" inside form but make profit of formik's validation
const useDisableNext = (values, errors, isValid, isSubmitting, step) => useMemo(
  () => (
    step === STEP.identifier
      ? Boolean(isEmpty(values.identifier) || errors.identifier || isSubmitting)
      : Boolean(!isValid || isSubmitting)),
  [values, errors, isValid, isSubmitting, step],
);

const useHandleErrors = (
  enqueueSnackbar,
  formProps,
  t,
) => useCallback((e) => {
  const response = handleApiErrors(e);
  if (response.fields) {
    handleLoginApiErrors(response, formProps);
    return;
  }

  if (response.error && isEmpty(response.fields)) {
    const text = t(response.error);
    enqueueSnackbar(text, { variant: 'error' });
  }
}, [enqueueSnackbar, formProps, t]);

const useRenewConfirmationCode = (
  enqueueSnackbar, formProps, initAuth, t, values,
) => useCallback(
  () => {
    const onSuccess = () => enqueueSnackbar(t('auth:signIn.form.action.getANewCode.success'), { variant: 'success' });
    return initAuth(values, formProps, onSuccess);
  },
  [enqueueSnackbar, formProps, initAuth, t, values],
);

const useFetchUser = (formProps, handleErrors, identifier, setUserPublicData) => useCallback(
  (onSuccess) => {
    formProps.setSubmitting(true);

    API.use(API.endpoints.user.public.read)
      .build({ email: identifier })
      .send()
      .then((response) => {
        setUserPublicData(objectToCamelCase(response));
        onSuccess();
      })
      .catch(handleErrors)
      .finally(() => formProps.setSubmitting(false));
  },
  [formProps, handleErrors, identifier, setUserPublicData],
);

const useHandlePrevious = (setStep) => useCallback(() => { setStep(STEP.identifier); }, [setStep]);

const useHandleNext = (
  dispatch,
  values,
  goToNextStep,
) => useCallback(() => {
  dispatch(screenAuthSetIdentifier(values.identifier));
  goToNextStep();
}, [dispatch, goToNextStep, values]);

const useGoToNextStep = (
  fetchUser,
  formProps,
  initAuth,
  step,
  values,
  setStep,
) => useCallback(() => {
  const onSuccess = () => fetchUser(() => setStep(STEP.secret));

  const onError = (error) => {
    const { identifierErrors, secretErrors: { password } } = getApiErrors(error);

    // CASES: initalStep is secret as login_hint is passed
    // or error password is required (seclevel insuffisent)
    if ((!isEmpty(identifierErrors) || password === required) && step !== STEP.identifier) {
      setStep(STEP.identifier);
    }

    // CASE: confirmation code is already sent (user click on goback)
    if (error.code === conflict) {
      const { channel, userId, renewalDate } = objectToCamelCase(error.details);
      if ((channel === conflict && userId === conflict) && renewalDate && step !== STEP.secret) {
        setStep(STEP.secret);
      }
    }
  };

  return initAuth(values, formProps, onSuccess, onError);
}, [fetchUser, formProps, initAuth, setStep, step, values]);


const useHandleIdentifierKeyPress = (handleNext, disableNext, setTouched) => useCallback(
  (event) => {
    if (event.key === 'Enter' && !disableNext) {
      event.preventDefault();
      handleNext();
      // @FIXME: this is a hotfix to create same behaviour as clicking on form button
      setTouched({ [STEP.identifier]: true });
    }
  },
  [disableNext, handleNext, setTouched],
);

const SignInForm = (
  { acr, dispatch, displayCard, fields, initAuth, initialStep, t, ...formProps },
) => {
  const { enqueueSnackbar } = useSnackbar();

  const { isValid, errors, isSubmitting, values, setTouched } = formProps;
  const [step, setStep] = React.useState(initialStep || STEP.identifier);
  const [userPublicData, setUserPublicData] = React.useState({ identifier: values.identifier });
  const secLevelConfig = useMemo(() => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL], [acr]);

  const disableNext = useDisableNext(values, errors, isValid, isSubmitting, step);
  const handleErrors = useHandleErrors(enqueueSnackbar, formProps, t);
  const fetchUser = useFetchUser(formProps, handleErrors, values.identifier, setUserPublicData);
  const handlePrevious = useHandlePrevious(setStep);
  const goToNextStep = useGoToNextStep(
    fetchUser, formProps, initAuth, step, values, setStep,
  );
  const handleNext = useHandleNext(dispatch, values, goToNextStep);
  const handleIdentifierKeyPress = useHandleIdentifierKeyPress(handleNext, disableNext, setTouched);
  const renewConfirmationCode = useRenewConfirmationCode(
    enqueueSnackbar,
    formProps,
    initAuth,
    t,
    values,
  );

  const newFields = {
    ...fields,
    ...secLevelConfig.fieldProps,
    identifier: { onKeyPress: handleIdentifierKeyPress, ...fields.identifier },
  };

  const Fields = <SignInFormFields {...newFields} step={step} acr={acr} />;

  const signInFormSecondaryAction = useSignInFormSecondaryAction(
    step, acr, t, renewConfirmationCode,
  );
  const signInFormPrimaryAction = useSignInFormPrimaryAction(
    disableNext, isSubmitting, isValid, handleNext, step, t,
  );

  const Card = displayCard && (
    <FormCard
      primary={signInFormPrimaryAction}
      secondary={signInFormSecondaryAction}
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

  const initStep = useCallback(() => {
    if (initialStep === STEP.secret) {
      goToNextStep();
    }
  }, [goToNextStep, initialStep]);

  useEffect(initStep, []);

  return Card || (
    <Form>
      {Fields}
      <SignInFormActions
        disableNext={disableNext}
        onNext={handleNext}
        renewConfirmationCode={renewConfirmationCode}
        step={step}
        t={t}
        {...formProps}
      />
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
  initAuth: PropTypes.func.isRequired,
  initialStep: PropTypes.string,
  values: PropTypes.objectOf(PropTypes.any),
  t: PropTypes.func.isRequired,
};

SignInForm.defaultProps = {
  displayCard: false,
  fields: {},
  initialStep: null,
};

export default connect((state) => ({ acr: state.sso.acr }))(withTranslation()(SignInForm));
