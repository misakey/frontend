import * as Yup from 'yup';
import { MAX_FILE_SIZE } from 'constants/file/size';
import { ACCEPTED_TYPES } from 'constants/file/image';
import errorTypes from 'constants/errorTypes';


// CONSTANTS
const DISPLAY_NAME_REGEX = /^[\da-zA-Z ]+$/;
const { invalid, malformed, required, conflict } = errorTypes;

export const displayNameValidationSchema = Yup.object().shape({
  displayName: Yup
    .string()
    .min(3, invalid)
    .max(21, invalid)
    .matches(DISPLAY_NAME_REGEX, { message: malformed, excludeEmptyString: true })
    .required(required),
});

export const avatarValidationSchema = Yup.object().shape({
  avatar: Yup.mixed()
    .required(required)
    .test('fileSize', 'size', ({ size }) => size <= MAX_FILE_SIZE)
    .test('fileType', 'format', ({ type }) => ACCEPTED_TYPES.includes(type)),
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
