import * as Yup from 'yup';
import errorTypes from 'constants/errorTypes';
import { MAX_FILE_SIZE } from 'constants/file/size';
import { ACCEPTED_TYPES } from 'constants/file/image';

// CONSTANTS
const { required, malformed } = errorTypes;
// @FIXME using this basic regex instead of Yup.url because it does not allow protocol omition
export const MAIN_DOMAIN_REGEX = /^(?:https?:\/\/)?(?:www\.)?([^.]+\.[a-zA-Z]+)$/;

export const mainDomainValidationSchema = Yup.object().shape({
  mainDomain: Yup
    .string()
    .matches(MAIN_DOMAIN_REGEX, { message: malformed, excludeEmptyString: true })
    .required(required),
});

export const nameValidationSchema = Yup.object().shape({
  name: Yup
    .string()
    .required(required),
});

export const logoValidationSchema = Yup.object().shape({
  logo: Yup.mixed()
    .required(required)
    .test('fileSize', 'size', ({ size }) => size <= MAX_FILE_SIZE)
    .test('fileType', 'format', ({ type }) => ACCEPTED_TYPES.includes(type)),
});

export const shortDescValidationSchema = Yup.object().shape({
  shortDesc: Yup
    .string()
    .max(40, malformed)
    .required(required),
});

export const longDescValidationSchema = Yup.object().shape({
  longDesc: Yup
    .string()
    .required(required),
});
