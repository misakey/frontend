import * as Yup from 'yup';

import {
  passwordFieldValidation, codeFieldValidation, webauthnFieldValidation,
} from 'constants/fieldValidations';

import { EMAILED_CODE, PREHASHED_PASSWORD, ACCOUNT_CREATION, WEBAUTHN, TOTP, TOTP_RECOVERY } from '@misakey/auth/constants/method';
import { malformed, required } from '@misakey/ui/constants/errorTypes';

const secretValidationSchemas = {
  [EMAILED_CODE]: codeFieldValidation.strictSchema,
  [PREHASHED_PASSWORD]: passwordFieldValidation.schema,
  [ACCOUNT_CREATION]: passwordFieldValidation.setSchema,
  [ACCOUNT_CREATION]: passwordFieldValidation.setSchema,
  [WEBAUTHN]: webauthnFieldValidation.schema,
  [TOTP]: codeFieldValidation.strictSchema,
  [TOTP_RECOVERY]: Yup.string().matches(/^[0-9a-zA-Z]{5}-[0-9a-zA-Z]{5}$/, { message: malformed }).required(required),
};

export const getSecretValidationSchema = (methodName) => Yup.object().shape({
  secret: secretValidationSchemas[methodName],
});

export const openVaultValidationSchema = Yup.object().shape({
  [PREHASHED_PASSWORD]: passwordFieldValidation.schema,
});

// @UNUSED
// export const signUpValidationSchema = Yup.object().shape({
//   handle: handleFieldValidation.setSchema,
//   notifications: notificationFieldValidation.requiredSchema,
//   email: emailFieldValidation.schema,
//   password: passwordFieldValidation.setSchema,

//   tos: switchFieldValidation.requiredSchema,
//   misakeyKnow: switchFieldValidation.requiredSchema,
//   misakeyCrypto: switchFieldValidation.requiredSchema,
// });

// const signUpValidationSchemaSteps = {
//   handle: handleFieldValidation.setSchema,
//   notifications: notificationFieldValidation.requiredSchema,
//   email: emailFieldValidation.schema,
//   password: passwordFieldValidation.setSchema,
//   passwordConfirm: passwordFieldValidation.confirmSchema('password'),

//   tos: switchFieldValidation.requiredSchema,
//   misakeyKnow: switchFieldValidation.requiredSchema,
//   misakeyCrypto: switchFieldValidation.requiredSchema,
// };

// export const stepSignUpValidationSchemas = [
//   Yup.object().shape(pick(['tos', 'misakeyKnow', 'misakeyCrypto'], signUpValidationSchemaSteps)),
//   Yup.object().shape(pick(['tos', 'email'], signUpValidationSchemaSteps)),
//   Yup.object().shape(pick(['tos', 'email', 'handle'], signUpValidationSchemaSteps)),
//   Yup.object()
// .shape(pick(['tos', 'email', 'handle', 'notifications'], signUpValidationSchemaSteps)),
//   Yup.object().shape(pick(
// ['tos', 'email', 'handle', 'notifications', 'password', 'passwordConfirm'],
// signUpValidationSchemaSteps
// )),
// ];

export const signUpConfirmValidationSchema = Yup.object().shape({
  code: codeFieldValidation.strictSchema,
});

export const createPasswordValidationSchema = Yup.object().shape({
  [PREHASHED_PASSWORD]: passwordFieldValidation.setSchema,
});

export const resetPasswordValidationSchema = createPasswordValidationSchema;
