import API from '@misakey/api';
import * as Yup from 'yup';
import { malformed, required } from '@misakey/ui/constants/errorTypes';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email(malformed)
    .required(required),
  password: Yup.string()
    .required(required),
});

export default validationSchema;

export const handleApiErrors = (e) => ({
  error: `httpStatus.error.${API.errors.filter(e.httpStatus)}`,
  fields: e.details,
});
