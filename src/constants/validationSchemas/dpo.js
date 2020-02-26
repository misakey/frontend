import * as Yup from 'yup';
import { MAX_FILE_SIZE } from 'constants/file/size';
import errorTypes from '@misakey/ui/constants/errorTypes';

import isString from '@misakey/helpers/isString';
import isNil from '@misakey/helpers/isNil';

const { required } = errorTypes;

export const serviceClaimValidationSchema = Yup.object().shape({
  code: Yup.string()
    // .matches(/^[0-9]{6}$/, { message: invalid })
    .required(required),
});

export const serviceRequestsReadValidationSchema = Yup.object().shape({
  blob: Yup.mixed()
    .required(required)
    .test('fileSize', 'size', (file) => !isNil(file) && file.size <= MAX_FILE_SIZE)
    .test('fileExtension', 'extension', (file) => !isNil(file) && isString(file.name) && file.name.includes('.')),
  // .test('fileType', 'format', ({ type }) => ACCEPTED_TYPES.includes(type)),
});
