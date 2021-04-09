import * as Yup from 'yup';

import { passwordFieldValidation } from '@misakey/ui/constants/fieldValidations';

import { PREHASHED_PASSWORD } from '@misakey/react/auth/constants/account/password';

export const openVaultValidationSchema = Yup.object().shape({
  [PREHASHED_PASSWORD]: passwordFieldValidation.schema,
});
