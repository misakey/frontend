import * as Yup from 'yup';
import {
  passwordFieldValidation, codeFieldValidation, webauthnFieldValidation,
} from '@misakey/ui/constants/fieldValidations';
import { WEBAUTHN, IDENTITY_PASSWORD, IDENTITY_EMAILED_CODE, TOTP, TOTP_RECOVERY } from '@misakey/core/auth/constants/amr';

import { malformed, required } from '@misakey/core/api/constants/errorTypes';

export const identifierValidationSchema = Yup.object().shape({
  identifier: Yup.string().email(malformed).required(required),
});

const secretValidationSchemas = {
  [IDENTITY_EMAILED_CODE]: codeFieldValidation.strictSchema,
  [IDENTITY_PASSWORD]: passwordFieldValidation.schema,
  [WEBAUTHN]: webauthnFieldValidation.schema,
  [TOTP]: codeFieldValidation.strictSchema,
  [TOTP_RECOVERY]: Yup.string().matches(/^[0-9a-zA-Z]{5}-[0-9a-zA-Z]{5}$/, { message: malformed }).required(required),
};

export const getSecretValidationSchema = (methodName) => Yup.object().shape({
  secret: secretValidationSchemas[methodName],
});
