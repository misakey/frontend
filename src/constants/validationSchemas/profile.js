import * as Yup from 'yup';
import MAIL_PROVIDERS from 'constants/mail-providers';
import MANUAL_TYPE from 'constants/mail-providers/manual';
import errorTypes from '@misakey/ui/constants/errorTypes';

import pick from '@misakey/helpers/pick';

import {
  codeFieldValidation, stringFieldValidation, emailFieldValidation,
  passwordFieldValidation, displayNameFieldValidation, fileFieldValidation,
} from 'constants/fieldValidations';


// CONSTANTS
const MAIL_TYPES = [...Object.keys(MAIL_PROVIDERS), MANUAL_TYPE];
const { malformed, required } = errorTypes;

export const displayNameValidationSchema = Yup.object().shape({
  displayName: displayNameFieldValidation.schema,
});

export const avatarValidationSchema = Yup.object().shape({
  avatar: fileFieldValidation.avatarSchema,
});

export const passwordValidationSchema = Yup.object().shape({
  passwordOld: passwordFieldValidation.schema,
  passwordNew: passwordFieldValidation.setSchema,
  passwordConfirm: Yup
    .string()
    .oneOf([Yup.ref('passwordNew'), null], malformed)
    .required(required),
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
