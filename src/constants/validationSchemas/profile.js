import * as Yup from 'yup';
import { MAX_AVATAR_SIZE } from 'constants/file/size';
import { ACCEPTED_TYPES } from 'constants/file/image';
import { CONFIRM_REGEX } from 'constants/auth';
import MAIL_PROVIDERS from 'constants/mail-providers';
import MANUAL_TYPE from 'constants/mail-providers/manual';
import errorTypes from '@misakey/ui/constants/errorTypes';

import pick from '@misakey/helpers/pick';
import isNil from '@misakey/helpers/isNil';

// CONSTANTS
const MAIL_TYPES = [...Object.keys(MAIL_PROVIDERS), MANUAL_TYPE];
const { invalid, malformed, required, conflict } = errorTypes;

export const displayNameValidationSchema = Yup.object().shape({
  displayName: Yup
    .string()
    .min(3, invalid)
    .max(21, invalid)
    .required(required),
});

export const avatarValidationSchema = Yup.object().shape({
  avatar: Yup.mixed()
    .required(required)
    .test('fileSize', 'size', (file) => !isNil(file) && file.size <= MAX_AVATAR_SIZE)
    .test('fileType', 'format', (file) => !isNil(file) && ACCEPTED_TYPES.includes(file.type)),
});

export const passwordValidationSchema = Yup.object().shape({
  passwordOld: Yup
    .string()
    .required(required),
  passwordNew: Yup
    .string()
    .min(8, malformed)
    .notOneOf([Yup.ref('passwordOld')], conflict)
    .required(required),
  passwordConfirm: Yup
    .string()
    .oneOf([Yup.ref('passwordNew'), null], malformed)
    .required(required),
});

const addEmailValidationSchemaSteps = {
  type: Yup.string()
    .required(required)
    .oneOf(MAIL_TYPES),
  email: Yup.string()
    .email(malformed)
    .required(required),
};

export const stepAddEmailValidationSchemas = [
  Yup.object().shape(pick(['type'], addEmailValidationSchemaSteps)),
  Yup.object().shape(addEmailValidationSchemaSteps),
];

export const confirmEmailValidationSchema = Yup.object().shape({
  userEmailId: Yup
    .string()
    .required(required),
  code: Yup
    .string()
    .matches(CONFIRM_REGEX, { message: malformed })
    .required(required),
});
