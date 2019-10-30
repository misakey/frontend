import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';

// CONSTANTS
const { malformed, required, invalid } = errorTypes;
const CONFIRM_REGEX = /^[0-9]{6}$/;

export const signInValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email(malformed)
    .required(required),
  password: Yup.string()
    .required(required),
});

export const signUpValidationSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(3, invalid)
    .max(25, invalid)
    .required(required),
  email: Yup.string()
    .email(malformed)
    .required(required),
  password: Yup.string()
    .required(required)
    .min(8, malformed),
  tos: Yup.boolean()
    .oneOf([true], required),
});

export const signUpConfirmValidationSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^[0-9]{6}$/, { message: invalid })
    .required(required),
});

export const forgotConfirmValidationSchema = Yup.object().shape({
  confirmationCode: Yup
    .string()
    .matches(CONFIRM_REGEX, { message: malformed })
    .required(required),
});

export const forgotResetPasswordValidationSchema = forgotConfirmValidationSchema.concat(
  Yup.object().shape({
    passwordNew: Yup
      .string()
      .min(8, 'malformed')
      .required('required'),
  }),
);

export const accessRequestValidationSchema = Yup.object().shape({
  code: Yup.string()
    // .matches(/^[0-9]{6}$/, { message: invalid })
    .required(required),
});
