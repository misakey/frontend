import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import BoxControls from 'components/dumb/Box/Controls';

import routes from 'routes';

export const useSignUpSecondaryAction = (t) => useMemo(() => ({
  to: routes.auth.signIn,
  component: Link,
  text: t('auth:signUp.form.action.signIn'),
}), [t]);

export const useSignUpPrimaryAction = ({ isSubmitting, isValid }, t) => useMemo(() => ({
  disabled: isSubmitting || !isValid,
  type: 'submit',
  text: t('auth:signUp.form.action.submit', 'next'),
}), [t, isSubmitting, isValid]);

const SignUpFormActions = ({ isSubmitting, isValid, t }) => {
  const signUpFormSecondaryAction = useSignUpSecondaryAction(t);
  const signUpFormPrimaryAction = useSignUpPrimaryAction(
    t, isSubmitting, isValid,
  );

  return (
    <BoxControls
      container
      direction="row"
      justify="space-between"
      alignItems="flex-start"
      primary={signUpFormPrimaryAction}
      secondary={signUpFormSecondaryAction}
    />
  );
};

SignUpFormActions.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default SignUpFormActions;
