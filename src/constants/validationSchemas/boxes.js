import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';

// CONSTANTS
const { required, malformed } = errorTypes;

export const boxNameFieldValidationSchema = Yup.object().shape({
  name: Yup.string().min(3, malformed).max(100, malformed).required(required),
});
