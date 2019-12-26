import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BoxControls from 'components/dumb/Box/Controls';
import { SECLEVEL_CONFIG, DEFAULT_SECLEVEL, STEP } from 'components/smart/Auth/SignIn/Form/constants';

import routes from 'routes';

export const useSignInFormSecondaryAction = (step, acr, t, renewConfirmationCode) => useMemo(() => {
  const stepType = SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL].fieldTypes[step];
  const secondaryActions = {
    identifier: {
      email: {
        buttonProps: {
          to: routes.auth.signUp._,
          component: Link,
        },
        textKey: 'auth:signIn.form.action.signUp',
      },
    },
    secret: {
      password: {
        buttonProps: {
          to: routes.auth.forgotPassword,
          component: Link,
        },
        textKey: 'auth:signIn.form.action.forgotPassword',
      },
      confirmationCode: {
        buttonProps: {
          onClick: renewConfirmationCode,
        },
        textKey: 'auth:signIn.form.action.getANewCode.button',
      },
    },
  };
  const { buttonProps, textKey } = secondaryActions[step][stepType];

  return {
    ...buttonProps,
    text: t(textKey),
  };
}, [acr, renewConfirmationCode, step, t]);

const primaryActionsTextKey = {
  identifier: 'auth:signIn.form.action.next',
  secret: 'auth:signIn.form.action.submit',
};

export const useSignInFormPrimaryAction = (
  disableNext,
  isSubmitting,
  isValid,
  onNext,
  step,
  t,
) => useMemo(() => {
  if (step === STEP.identifier) {
    return {
      onClick: onNext,
      disabled: disableNext,
      text: t(primaryActionsTextKey[step]),
    };
  }
  if (step === STEP.secret) {
    return {
      type: 'submit',
      disabled: isSubmitting || !isValid,
      text: t(primaryActionsTextKey[step]),
    };
  }
  return {};
}, [disableNext, isSubmitting, isValid, onNext, step, t]);


const SignInFormActions = ({
  disableNext,
  isSubmitting,
  isValid,
  onNext,
  step,
  renewConfirmationCode,
  acr,
  t,
}) => {
  const signInFormSecondaryAction = useSignInFormSecondaryAction(
    step, acr, t, renewConfirmationCode,
  );
  const signInFormPrimaryAction = useSignInFormPrimaryAction(
    disableNext, isSubmitting, isValid, onNext, step, t,
  );

  return (
    <BoxControls
      container
      direction="row"
      justify="space-between"
      alignItems="flex-start"
      primary={signInFormPrimaryAction}
      secondary={signInFormSecondaryAction}
    />
  );
};

SignInFormActions.propTypes = {
  acr: PropTypes.number,
  disableNext: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  renewConfirmationCode: PropTypes.func.isRequired,
  step: PropTypes.oneOf([STEP.identifier, STEP.secret]).isRequired,
  t: PropTypes.func.isRequired,
};

SignInFormActions.defaultProps = {
  acr: null,
};

export default SignInFormActions;
