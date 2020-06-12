import * as Yup from 'yup';

import {
  codeFieldValidation, stringFieldValidation,
  passwordFieldValidation, displayNameFieldValidation, fileFieldValidation,
  notificationFieldValidation,
} from 'constants/fieldValidations';


export const displayNameValidationSchema = Yup.object().shape({
  displayName: displayNameFieldValidation.schema,
});

export const notificationsValidationSchema = Yup.object().shape({
  notifications: notificationFieldValidation.requiredSchema,
});

export const avatarValidationSchema = Yup.object().shape({
  avatar: fileFieldValidation.avatarSchema,
});

export const passwordValidationSchema = Yup.object().shape({
  passwordOld: passwordFieldValidation.schema,
  passwordNew: passwordFieldValidation.setSchema,
  passwordConfirm: passwordFieldValidation.confirmSchema('passwordNew'),
});

export const confirmEmailValidationSchema = Yup.object().shape({
  userEmailId: stringFieldValidation.requiredSchema,
  code: codeFieldValidation.strictSchema,
});
