import * as Yup from 'yup';

import { codeFieldValidation, fileFieldValidation } from 'constants/fieldValidations';


export const serviceClaimValidationSchema = Yup.object().shape({
  code: codeFieldValidation.schema,
});

export const serviceRequestsReadValidationSchema = Yup.object().shape({
  blob: fileFieldValidation.blobSchema,
});
