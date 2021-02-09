import * as Yup from 'yup';
import {
  passwordFieldValidation, codeFieldValidation, webauthnFieldValidation,
} from '@misakey/ui/constants/fieldValidations';
import { EMAILED_CODE, PREHASHED_PASSWORD, ACCOUNT_CREATION, RESET_PASSWORD, WEBAUTHN, TOTP, TOTP_RECOVERY } from '@misakey/auth/constants/method';

import { malformed, required } from '@misakey/ui/constants/errorTypes';

export const identifierValidationSchema = Yup.object().shape({
  identifier: Yup.string().email(malformed).required(required),
});

const secretValidationSchemas = {
  [EMAILED_CODE]: codeFieldValidation.strictSchema,
  [PREHASHED_PASSWORD]: passwordFieldValidation.schema,
  [ACCOUNT_CREATION]: passwordFieldValidation.setSchema,
  [RESET_PASSWORD]: passwordFieldValidation.setSchema,
  [WEBAUTHN]: webauthnFieldValidation.schema,
  [TOTP]: codeFieldValidation.strictSchema,
  [TOTP_RECOVERY]: Yup.string().matches(/^[0-9a-zA-Z]{5}-[0-9a-zA-Z]{5}$/, { message: malformed }).required(required),
};

export const getSecretValidationSchema = (methodName) => Yup.object().shape({
  secret: secretValidationSchemas[methodName],
});
