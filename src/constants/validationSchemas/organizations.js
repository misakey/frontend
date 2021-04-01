import * as Yup from 'yup';

import { required } from '@misakey/core/api/constants/errorTypes';
import { emailFieldValidation } from '@misakey/ui/constants/fieldValidations';

// CONSTANTS
export const organizationCreateSchema = Yup.object().shape({
  name: Yup.string().trim().required(required),
});

export const agentsAddSchema = Yup.object().shape({
  agents: Yup.array(Yup.object().shape({ // eslint-disable-line react/forbid-prop-types
    identifierValue: emailFieldValidation.schema,
  })),
});
