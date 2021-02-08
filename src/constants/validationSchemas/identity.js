import * as Yup from 'yup';

import { OLD_PASSWORD_KEY, NEW_PASSWORD_KEY, PASSWORD_CONFIRM_KEY } from 'constants/account';
import {
  codeFieldValidation, stringFieldValidation,
  passwordFieldValidation, displayNameFieldValidation, fileFieldValidation,
  notificationFieldValidation, colorFieldValidation,
} from 'constants/fieldValidations';


export const displayNameValidationSchema = Yup.object().shape({
  displayName: displayNameFieldValidation.schema,
});

export const notificationsValidationSchema = Yup.object().shape({
  notifications: notificationFieldValidation.requiredSchema,
});

export const colorValidationSchema = Yup.object().shape({
  color: colorFieldValidation.requiredSchema,
});

export const avatarValidationSchema = Yup.object().shape({
  avatar: fileFieldValidation.avatarSchema,
});

export const webauthnDeviceValidationSchema = Yup.object().shape({
  name: Yup.string().trim(),
});

export const totpEnrollValidationSchema = Yup.object().shape({
  code: codeFieldValidation.strictSchema,
});

export const passwordValidationSchema = Yup.object().shape({
  [OLD_PASSWORD_KEY]: passwordFieldValidation.schema,
  [NEW_PASSWORD_KEY]: passwordFieldValidation.setSchema,
  [PASSWORD_CONFIRM_KEY]: passwordFieldValidation.confirmSchema(NEW_PASSWORD_KEY),
});

export const confirmEmailValidationSchema = Yup.object().shape({
  userEmailId: stringFieldValidation.requiredSchema,
  code: codeFieldValidation.strictSchema,
});
