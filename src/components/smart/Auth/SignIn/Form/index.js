import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import { screenAuthSetIdentifier, screenAuthSetPublics } from 'store/actions/screens/auth';
import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';


import { FIELD_PROPTYPES } from 'components/dumb/Form/Fields';

import FormCardAuth from 'components/dumb/Form/Card/Auth';
import AuthCardTitle from 'components/smart/Auth/Card/Title';
import CardHeaderAuth from 'components/smart/Card/Header/Auth';
import Button from 'components/dumb/Button';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isEmpty from '@misakey/helpers/isEmpty';

import { useSignInFormPrimaryAction, useSignInFormContentAction, useSignInFormSecondaryAction } from 'hooks/useActions/signIn';
import makeStyles from '@material-ui/core/styles/makeStyles';

import SignInFormFields from 'components/smart/Auth/SignIn/Form/Fields';
import SignInCardContent from 'components/smart/Auth/SignIn/Form/CardContent';

import errorTypes from 'constants/errorTypes';

import { STEP, DEFAULT_SECLEVEL, SECLEVEL_CONFIG } from 'components/smart/Auth/SignIn/Form/constants';
import { handleLoginApiErrors, getApiErrors } from 'components/smart/Auth/SignIn/helpers';

const { conflict, required } = errorTypes;

// HOOKS
const useStyles = makeStyles(() => ({
  buttonRoot: {
    width: 'auto',
  },
}));

// @FIXME: better not use "value check" inside form but make profit of formik's validation
const useDisableNext = (values, errors, isValid, isSubmitting, step) => useMemo(
  () => (
    step === STEP.identifier
      ? Boolean(isEmpty(values.identifier) || errors.identifier || isSubmitting)
      : Boolean(!isValid || isSubmitting)),
  [values, errors, isValid, isSubmitting, step],
);

const useHandleErrors = (formProps, handleGenericHttpErrors) => useCallback((e) => {
  if (!isEmpty(e.details)) {
    handleLoginApiErrors({ fields: e.details }, formProps);
  } else {
    handleGenericHttpErrors(e);
  }
}, [formProps, handleGenericHttpErrors]);

const useRenewConfirmationCode = (
  enqueueSnackbar, formProps, initAuth, t, values,
) => useCallback(
  () => {
    const onSuccess = () => enqueueSnackbar(t('auth:signIn.form.action.getANewCode.success'), { variant: 'success' });
    return initAuth(values, formProps, onSuccess);
  },
  [enqueueSnackbar, formProps, initAuth, t, values],
);

const useFetchUser = (formProps, handleErrors, identifier, dispatch) => useCallback(
  (onSuccess) => {
    formProps.setSubmitting(true);

    API.use(API.endpoints.user.public.read)
      .build({ email: identifier })
      .send()
      .then((response) => {
        dispatch(screenAuthSetPublics(objectToCamelCase(response)));
        onSuccess();
      })
      .catch(handleErrors)
      .finally(() => formProps.setSubmitting(false));
  },
  [formProps, handleErrors, identifier, dispatch],
);

const useHandlePrevious = (setStep, dispatch) => useCallback(() => {
  setStep(STEP.identifier);
  dispatch(screenAuthSetIdentifier(''));
  dispatch(screenAuthSetPublics(null));
}, [setStep, dispatch]);

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
  fetchUser(
    () => {
      // @FIXME cleanup this code by using useCallback for onSuccess and onError
      const onSuccess = () => setStep(STEP.secret);

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
          if (
            (channel === conflict && userId === conflict) && renewalDate && step !== STEP.secret
          ) {
            setStep(STEP.secret);
          }
        }
      };
      return initAuth(values, formProps, onSuccess, onError);
    },
  );
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
  { acr, publics, dispatch, fields, initAuth, initialStep, t, ...formProps },
) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const { isValid, errors, isSubmitting, values, setTouched } = formProps;
  const [step, setStep] = React.useState(initialStep || STEP.identifier);
  const userPublicData = useMemo(
    () => (publics || ({ identifier: values.identifier })),
    [publics, values],
  );
  const secLevelConfig = useMemo(() => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL], [acr]);

  const disableNext = useDisableNext(values, errors, isValid, isSubmitting, step);
  const handleErrors = useHandleErrors(formProps, handleGenericHttpErrors);
  const fetchUser = useFetchUser(formProps, handleErrors, values.identifier, dispatch);
  const handlePrevious = useHandlePrevious(setStep, dispatch);
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

  const signInFormContentAction = useSignInFormContentAction(
    step, acr, t, renewConfirmationCode,
  );
  const signInFormPrimaryAction = useSignInFormPrimaryAction(
    disableNext, isSubmitting, isValid, handleNext, step, t,
  );

  const secondary = useSignInFormSecondaryAction(step, acr, handlePrevious, t);

  const initStep = useCallback(() => {
    if (initialStep === STEP.secret) {
      goToNextStep();
    }
  }, [goToNextStep, initialStep]);

  useEffect(initStep, []);

  return (
    <FormCardAuth
      primary={signInFormPrimaryAction}
      secondary={secondary}
      title={<AuthCardTitle name="signIn" />}
      subtitle={t('auth:signIn.card.subtitle.text')}
      Header={CardHeaderAuth}
    >
      <SignInCardContent
        fields={Fields}
        actions={<Button classes={classes} {...signInFormContentAction} />}
        handlePrevious={handlePrevious}
        step={step}
        userPublicData={userPublicData}
        values={values}
      />
    </FormCardAuth>
  );
};

SignInForm.propTypes = {
  // CONNECT
  acr: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  publics: PropTypes.object,
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
  acr: null,
  displayCard: false,
  fields: {},
  errors: {},
  values: {},
  initialStep: null,
  publics: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  acr: state.sso.acr,
  publics: state.screens.auth.publics,
});

export default connect(mapStateToProps)(withTranslation(['auth', 'common'])(SignInForm));
