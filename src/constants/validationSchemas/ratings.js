import * as Yup from 'yup';

import { ratingFieldValidation, commentFieldValidation } from 'constants/fieldValidations';

export const ratingValidationSchema = Yup.object().shape({
  value: ratingFieldValidation.schema,
  comment: commentFieldValidation.schema,
});
