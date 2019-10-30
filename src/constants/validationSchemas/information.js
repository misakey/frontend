import * as Yup from 'yup';
import { ACCEPTED_TYPES } from 'constants/file/image';

// CONSTANTS
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MO


export const nameValidationSchema = Yup.object().shape({
  name: Yup
    .string()
    .required('required'),
});

export const logoValidationSchema = Yup.object().shape({
  logo: Yup.mixed()
    .required('required')
    .test('fileSize', 'size', ({ size }) => size <= MAX_FILE_SIZE)
    .test('fileType', 'format', ({ type }) => ACCEPTED_TYPES.includes(type)),
});

export const shortDescValidationSchema = Yup.object().shape({
  shortDesc: Yup
    .string()
    .max(40, 'malformed')
    .required('required'),
});

export const longDescValidationSchema = Yup.object().shape({
  longDesc: Yup
    .string()
    .required('required'),
});
