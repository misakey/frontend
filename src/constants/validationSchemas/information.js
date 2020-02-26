import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { MAX_AVATAR_SIZE } from 'constants/file/size';
import { ACCEPTED_TYPES } from 'constants/file/image';

import isNil from '@misakey/helpers/isNil';

// CONSTANTS
const { required, malformed } = errorTypes;
// @FIXME using this basic regex instead of Yup.url because it does not allow protocol omition
export const MAIN_DOMAIN_REGEX = /^(?:https?:\/\/)?(([-a-z0-9]+\.)+[a-z0-9]+).*$/;


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
    .test('fileSize', 'size', (file) => !isNil(file) && file.size <= MAX_AVATAR_SIZE)
    .test('fileType', 'format', (file) => !isNil(file) && ACCEPTED_TYPES.includes(file.type)),
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
