import * as Yup from 'yup';
import errorTypes from 'constants/errorTypes';

const { required, malformed } = errorTypes;

export const ratingValidationSchema = Yup.object().shape({
  value: Yup
    .number()
    .min(1, required)
    .max(5, malformed)
    .required(required),
  comment: Yup
    .string()
    .min(10, malformed)
    .max(4096, malformed)
    .required(required),
});
