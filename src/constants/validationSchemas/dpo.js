import * as Yup from 'yup';
import { MAX_FILE_SIZE } from 'constants/file/size';
import errorTypes from '@misakey/ui/constants/errorTypes';

const { required } = errorTypes;

export const serviceClaimValidationSchema = Yup.object().shape({
  code: Yup.string()
    // .matches(/^[0-9]{6}$/, { message: invalid })
    .required(required),
});

export const serviceRequestsReadValidationSchema = Yup.object().shape({
  blob: Yup.mixed()
    .required(required)
    .test('fileSize', 'size', ({ size }) => size <= MAX_FILE_SIZE),
  // .test('fileType', 'format', ({ type }) => ACCEPTED_TYPES.includes(type)),
});
