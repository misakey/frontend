import * as Yup from 'yup';
import errorTypes from 'constants/errorTypes';

// CONSTANTS
const { malformed, required, invalid } = errorTypes;
const noTrailingUnderscore = 'noTrailingUnderscore';


const CONFIRM_REGEX = /^[0-9]{6}$/;

export const signInValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email(malformed)
    .required(required),
  password: Yup.string()
    .required(required),
});


export const openVaultValidationSchema = Yup.object().shape({
  password: Yup.string()
    .required(required),
});

export const signUpValidationSchema = Yup.object().shape({
  handle: Yup.string()
    .required(required)
    .min(3, invalid)
    .max(21, invalid)
    .matches(/^[a-z0-9_]*$/, { message: invalid, excludeEmptyString: true })
    .matches(/^[^_].*[^_]$/, { message: noTrailingUnderscore, excludeEmptyString: true }),
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
