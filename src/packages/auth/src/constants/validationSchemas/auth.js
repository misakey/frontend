import * as Yup from 'yup';

import errorTypes from '@misakey/ui/constants/errorTypes';

// CONSTANTS
const { malformed, required } = errorTypes;

// @FIXME find a solution to reunify these fieldValidation and validationSchema with others
// from constants
export const identifierValidationSchema = Yup.object().shape({
  identifier: Yup.string().email(malformed).required(required),
});
