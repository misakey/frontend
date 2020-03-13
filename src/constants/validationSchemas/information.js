import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { MAX_AVATAR_SIZE } from 'constants/file/size';
import { ACCEPTED_TYPES } from 'constants/file/image';

import isNil from '@misakey/helpers/isNil';

// CONSTANTS
const { required, malformed } = errorTypes;

// @FIXME: export that into a fieldValidation when we'll use it
export const nameValidationSchema = Yup.object().shape({
  name: Yup
    .string()
    .required(required),
});

// @FIXME: export that into a fieldValidation when we'll use it
export const logoValidationSchema = Yup.object().shape({
  logo: Yup.mixed()
    .required(required)
    .test('fileSize', 'size', (file) => !isNil(file) && file.size <= MAX_AVATAR_SIZE)
    .test('fileType', 'format', (file) => !isNil(file) && ACCEPTED_TYPES.includes(file.type)),
});

// @FIXME: export that into a fieldValidation when we'll use it
export const shortDescValidationSchema = Yup.object().shape({
  shortDesc: Yup.string().max(40, malformed).required(required),
});

// @FIXME: export that into a fieldValidation when we'll use it
export const longDescValidationSchema = Yup.object().shape({
  longDesc: Yup.string().required(required),
});
