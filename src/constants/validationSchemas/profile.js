import * as Yup from 'yup';
import { MAX_AVATAR_SIZE } from 'constants/file/size';
import { ACCEPTED_TYPES } from 'constants/file/image';
import errorTypes from '@misakey/ui/constants/errorTypes';


// CONSTANTS
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
    .test('fileSize', 'size', ({ size }) => size <= MAX_AVATAR_SIZE)
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
