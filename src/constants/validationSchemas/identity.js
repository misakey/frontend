import * as Yup from 'yup';
import MAIL_PROVIDERS from 'constants/mail-providers';
import MANUAL_TYPE from 'constants/mail-providers/manual';
import errorTypes from '@misakey/ui/constants/errorTypes';

import pick from '@misakey/helpers/pick';

import {
  codeFieldValidation, stringFieldValidation, emailFieldValidation,
  passwordFieldValidation, displayNameFieldValidation, fileFieldValidation,
  notificationFieldValidation,
} from 'constants/fieldValidations';


// CONSTANTS
const MAIL_TYPES = [...Object.keys(MAIL_PROVIDERS), MANUAL_TYPE];
const { required } = errorTypes;

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

const addEmailValidationSchemaSteps = {
  type: Yup.string().required(required).oneOf(MAIL_TYPES),
  email: emailFieldValidation.schema,
};

export const stepAddEmailValidationSchemas = [
  Yup.object().shape(pick(['type'], addEmailValidationSchemaSteps)),
  Yup.object().shape(addEmailValidationSchemaSteps),
];

export const confirmEmailValidationSchema = Yup.object().shape({
  userEmailId: stringFieldValidation.requiredSchema,
  code: codeFieldValidation.strictSchema,
});
