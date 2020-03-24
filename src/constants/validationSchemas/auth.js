import * as Yup from 'yup';
import mapValues from '@misakey/helpers/mapValues';
import pick from '@misakey/helpers/pick';

import {
  emailFieldValidation, passwordFieldValidation, codeFieldValidation,
  handleFieldValidation, switchFieldValidation, notificationFieldValidation,
} from 'constants/fieldValidations';


const signInValidationSchema = {
  identifier: {
    email: emailFieldValidation.schema,
  },
  secret: {
    password: passwordFieldValidation.schema,
    confirmationCode: codeFieldValidation.schema,
  },
};

export const getSignInValidationSchema = (fieldTypes, step) => Yup.object().shape(
  pick([step], mapValues(signInValidationSchema, (value, key) => value[fieldTypes[key]])),
);

export const openVaultValidationSchema = Yup.object().shape({
  password: passwordFieldValidation.schema,
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
  passwordConfirm: passwordFieldValidation.requiredSchema,

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

export const forgotConfirmValidationSchema = Yup.object().shape({
  confirmationCode: codeFieldValidation.strictSchema,
});

export const forgotResetPasswordValidationSchema = forgotConfirmValidationSchema.concat(
  Yup.object().shape({
    passwordNew: passwordFieldValidation.setSchema,
  }),
);

export const accessRequestValidationSchema = Yup.object().shape({
  code: codeFieldValidation.schema,
});
