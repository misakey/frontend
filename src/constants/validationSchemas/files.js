import * as Yup from 'yup';
import { MAX_FILE_SIZE } from 'constants/file/size';
import { required } from '@misakey/ui/constants/errorTypes';
import isString from '@misakey/helpers/isString';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

// CONSTANTS
export const fileUploadValidationSchema = Yup.object().shape({
  files: Yup.array(
    Yup.mixed()
      .test('fileSize', 'size', (file) => isNil(file) || isNil(file.blob) || file.blob.size <= MAX_FILE_SIZE)
      .test('fileExtension', 'extension', (file) => isNil(file) || isNil(file.blob) || (isString(file.blob.name) && file.blob.name.split('.').length > 1))
      .test('fileName', 'name', (file) => isNil(file) || isNil(file.blob) || (isString(file.blob.name) && !isEmpty(file.blob.name.split('.').shift()))),
  ).required(required),
});
