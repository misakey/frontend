import * as Yup from 'yup';

import { required } from '@misakey/ui/constants/errorTypes';

// CONSTANTS
export const organizationCreateSchema = Yup.object().shape({
  name: Yup.string().trim().required(required),
});
