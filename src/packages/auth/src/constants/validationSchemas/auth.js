import * as Yup from 'yup';

import { malformed, required } from '@misakey/ui/constants/errorTypes';

// @FIXME find a solution to reunify these fieldValidation and validationSchema with others
// from constants
export const identifierValidationSchema = Yup.object().shape({
  identifier: Yup.string().email(malformed).required(required),
});
