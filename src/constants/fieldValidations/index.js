import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { MAX_FILE_SIZE, MAX_AVATAR_SIZE } from 'constants/file/size';
import { ACCEPTED_TYPES } from 'constants/file/image';
import { NOTIFICATIONS } from 'constants/notifications';

import isString from '@misakey/helpers/isString';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';


// CONSTANTS
const { malformed, required, invalid, noTrailingUnderscore } = errorTypes;

export const emailFieldValidation = {
  schema: Yup.string().email(malformed).required(required),
};

export const passwordFieldValidation = {
  schema: Yup.string().required(required),
  setSchema: Yup.string().required(required).min(8, malformed),
  confirmSchema: (ref) => Yup.string().oneOf([Yup.ref(ref), null], malformed).required(required),
};


export const codeFieldValidation = {
  schema: Yup.string().required(required),
  strictSchema: Yup.string().matches(/^[0-9]{6}$/, { message: malformed }).required(required),
};


export const handleFieldValidation = {
  setSchema: Yup.string()
    .required(required)
    .min(3, invalid)
    .max(21, invalid)
    .matches(/^[a-z0-9_]*$/, { message: invalid, excludeEmptyString: true })
    .matches(/^[^_].*[^_]$/, { message: noTrailingUnderscore, excludeEmptyString: true }),
};

export const switchFieldValidation = {
  requiredSchema: Yup.boolean().oneOf([true], required),
};

export const notificationFieldValidation = {
  requiredSchema: Yup.string()
    .required(required)
    .oneOf(NOTIFICATIONS),
};

export const colorFieldValidation = {
  requiredSchema: Yup.string()
    .required(required)
    .matches(/^#[0-9a-f]{3,6}$/i),
};

export const fileFieldValidation = {
  blobSchema: Yup.mixed()
    .test('fileSize', 'size', (file) => isNil(file) || file.size <= MAX_FILE_SIZE)
    .test('fileExtension', 'extension', (file) => isNil(file) || (isString(file.name) && file.name.split('.').length > 1))
    .test('fileName', 'name', (file) => isNil(file) || (isString(file.name) && !isEmpty(file.name.split('.').shift()))),
  // .test('fileType', 'format', ({ type }) => ACCEPTED_TYPES.includes(type)),
  avatarSchema: Yup.mixed()
    .required(required)
    .test('fileSize', 'size', (file) => !isNil(file) && file.size <= MAX_AVATAR_SIZE)
    .test('fileType', 'format', (file) => !isNil(file) && ACCEPTED_TYPES.includes(file.type)),
};

export const stringFieldValidation = {
  requiredSchema: Yup.string().required(required),
};

export const displayNameFieldValidation = {
  schema: Yup.string().min(3, invalid).max(254, invalid).required(required),
};
