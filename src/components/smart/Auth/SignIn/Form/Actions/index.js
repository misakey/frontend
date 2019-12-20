import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BoxControls from 'components/dumb/Box/Controls';

import routes from 'routes';

const secondaryActions = {
  email: {
    to: routes.auth.signUp._,
    textKey: 'auth:signIn.form.action.signUp',
  },
  password: {
    to: routes.auth.forgotPassword,
    textKey: 'auth:signIn.form.action.forgotPassword',
  },
};

export const useSignInFormSecondaryAction = (step, t) => useMemo(() => {
  const { to, textKey } = secondaryActions[step];
  return {
    to,
    component: Link,
    text: t(textKey),
  };
}, [step, t]);

const primaryActionsTextKey = {
  email: 'auth:signIn.form.action.next',
  password: 'auth:signIn.form.action.submit',
};

export const useSignInFormPrimaryAction = (
  disableNext,
  isSubmitting,
  isValid,
  onNext,
  step,
  t,
) => useMemo(() => {
  if (step === 'email') {
    return {
      onClick: onNext,
      disabled: disableNext,
      text: t(primaryActionsTextKey[step]),
    };
  }
  if (step === 'password') {
    return {
      type: 'submit',
      disabled: isSubmitting || !isValid,
      text: t(primaryActionsTextKey[step]),
    };
  }
  return {};
}, [disableNext, isSubmitting, isValid, onNext, step, t]);


const SignInFormActions = ({ disableNext, isSubmitting, isValid, onNext, step, t }) => {
  const signInFormSecondaryAction = useSignInFormSecondaryAction(step, t);
  const signInFormPrimaryAction = useSignInFormPrimaryAction(
    disableNext, isSubmitting, isValid, onNext, step,
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
  disableNext: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  step: PropTypes.oneOf(['email', 'password']).isRequired,
};

export default SignInFormActions;
