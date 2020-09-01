import * as Yup from 'yup';

import {
  emailFieldValidation, passwordFieldValidation, codeFieldValidation,
  handleFieldValidation, switchFieldValidation, notificationFieldValidation,
} from 'constants/fieldValidations';

import { EMAILED_CODE, PREHASHED_PASSWORD, ACCOUNT_CREATION } from '@misakey/auth/constants/method';

import pick from '@misakey/helpers/pick';

const secretValidationSchemas = {
  [EMAILED_CODE]: codeFieldValidation.strictSchema,
  [PREHASHED_PASSWORD]: passwordFieldValidation.schema,
  [ACCOUNT_CREATION]: passwordFieldValidation.setSchema,
};

export const getSecretValidationSchema = (methodName) => Yup.object().shape({
  secret: secretValidationSchemas[methodName],
});

export const openVaultValidationSchema = Yup.object().shape({
  [PREHASHED_PASSWORD]: passwordFieldValidation.schema,
});

export const signUpValidationSchema = Yup.object().shape({
  handle: handleFieldValidation.setSchema,
  notifications: notificationFieldValidation.requiredSchema,
  email: emailFieldValidation.schema,
  password: passwordFieldValidation.setSchema,

  tos: switchFieldValidation.requiredSchema,
  misakeyKnow: switchFieldValidation.requiredSchema,
  misakeyCrypto: switchFieldValidation.requiredSchema,
});

const signUpValidationSchemaSteps = {
  handle: handleFieldValidation.setSchema,
  notifications: notificationFieldValidation.requiredSchema,
  email: emailFieldValidation.schema,
  password: passwordFieldValidation.setSchema,
  passwordConfirm: passwordFieldValidation.confirmSchema('password'),

  tos: switchFieldValidation.requiredSchema,
  misakeyKnow: switchFieldValidation.requiredSchema,
  misakeyCrypto: switchFieldValidation.requiredSchema,
};

export const stepSignUpValidationSchemas = [
  Yup.object().shape(pick(['tos', 'misakeyKnow', 'misakeyCrypto'], signUpValidationSchemaSteps)),
  Yup.object().shape(pick(['tos', 'email'], signUpValidationSchemaSteps)),
  Yup.object().shape(pick(['tos', 'email', 'handle'], signUpValidationSchemaSteps)),
  Yup.object().shape(pick(['tos', 'email', 'handle', 'notifications'], signUpValidationSchemaSteps)),
  Yup.object().shape(pick(['tos', 'email', 'handle', 'notifications', 'password', 'passwordConfirm'], signUpValidationSchemaSteps)),
];

export const signUpConfirmValidationSchema = Yup.object().shape({
  code: codeFieldValidation.strictSchema,
});

export const createPasswordValidationSchema = Yup.object().shape({
  [PREHASHED_PASSWORD]: passwordFieldValidation.setSchema,
});

export const resetPasswordValidationSchema = createPasswordValidationSchema;
