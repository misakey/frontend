import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MO

const { required } = errorTypes;

export default Yup.object().shape({
  blob: Yup.mixed()
    .required(required)
    .test('fileSize', 'size', ({ size }) => size <= MAX_FILE_SIZE),
  // .test('fileType', 'format', ({ type }) => ACCEPTED_TYPES.includes(type)),
});
