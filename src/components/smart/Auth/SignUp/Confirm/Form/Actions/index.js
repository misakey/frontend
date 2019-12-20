import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import BoxControls from 'components/dumb/Box/Controls';

import API from '@misakey/api';

export const useSignUpConfirmPrimaryAction = ({ isSubmitting, isValid }, t) => useMemo(() => ({
  type: 'submit',
  disabled: isSubmitting || !isValid,
  text: t('auth:signUpConfirm.form.action.submit', 'next'),
}), [isSubmitting, isValid, t]);

export const useReSendConfirmCode = (email, enqueueSnackbar, setSending, t) => useCallback(() => {
  setSending(true);

  API.use(API.endpoints.auth.askConfirm)
    .build(undefined, { email })
    .send()
    .then(() => {
      const text = t('auth:signUpConfirm.form.resend.success', { email });
      enqueueSnackbar(text, { variant: 'success' });
    })
    .catch((e) => {
      const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
      enqueueSnackbar(text, { variant: 'error' });
    })
    .finally(() => setSending(false));
}, [email, enqueueSnackbar, setSending, t]);

export const useSignUpConfirmSecondaryAction = (reSendConfirmCode, isSending, t) => useMemo(() => ({
  onClick: reSendConfirmCode,
  isLoading: isSending,
  disabled: isSending,
  text: t('auth:signUpConfirm.form.action.resend'),
}), [isSending, reSendConfirmCode, t]);


const SignUpConfirmFormActions = ({ isSubmitting, isValid, email, t }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isSending, setSending] = React.useState(false);

  const reSendConfirmCode = useReSendConfirmCode(email, enqueueSnackbar, setSending, t);
  const signUpConfirmSecondaryAction = useSignUpConfirmSecondaryAction(
    reSendConfirmCode, isSending, t,
  );
  const signUpConfirmPrimaryAction = useSignUpConfirmPrimaryAction(
    isSubmitting, isValid, t,
  );

  return (
    <BoxControls
      container
      direction="row"
      justify="space-between"
      alignItems="flex-start"
      primary={signUpConfirmPrimaryAction}
      secondary={signUpConfirmSecondaryAction}
    />
  );
};

SignUpConfirmFormActions.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  email: PropTypes.string.isRequired,
  t: PropTypes.string.isRequired,
};

export default SignUpConfirmFormActions;
