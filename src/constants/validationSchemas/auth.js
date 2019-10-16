import * as Yup from 'yup';
import { malformed, required } from '@misakey/ui/constants/errorTypes';

// CONSTANTS
const CONFIRM_REGEX = /^[0-9]{6}$/;

export const forgotConfirmForm = Yup.object().shape({
  confirmationCode: Yup
    .string()
    .matches(CONFIRM_REGEX, { message: malformed })
    .required(required),
});

export const forgotResetPasswordForm = forgotConfirmForm.concat(
  Yup.object().shape({
    passwordNew: Yup
      .string()
      .min(8, 'malformed')
      .required('required'),
  }),
);
