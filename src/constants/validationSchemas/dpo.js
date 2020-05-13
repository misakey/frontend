import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { codeFieldValidation, fileFieldValidation } from 'constants/fieldValidations';

// CONSTANTS
const { required } = errorTypes;

export const serviceClaimValidationSchema = Yup.object().shape({
  code: codeFieldValidation.schema,
});

export const serviceRequestsReadValidationSchema = Yup.object().shape({
  blob: fileFieldValidation.blobSchema,
  blobs: Yup.array()
    .required(required)
    .max(10, 'max'),
});
