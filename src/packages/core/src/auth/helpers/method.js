import { WEBAUTHN, IDENTITY_PASSWORD, IDENTITY_EMAILED_CODE, TOTP, TOTP_RECOVERY } from '@misakey/core/auth/constants/amr';
import { AuthUndefinedMethodName } from '@misakey/core/auth/constants/step';

import hashPassword from '@misakey/core/auth/passwordHashing/hashPassword';
import isNil from '@misakey/core/helpers/isNil';

export const makeMetadata = async (methodName, { secret, metadata }) => {
  if (isNil(methodName)) {
    throw new AuthUndefinedMethodName();
  }

  switch (methodName) {
    case IDENTITY_EMAILED_CODE:
    case TOTP:
      return { code: secret };
    case IDENTITY_PASSWORD:
      return hashPassword({ password: secret, pwdHashParams: metadata });
    case WEBAUTHN:
      return secret;
    case TOTP_RECOVERY:
      return { recoveryCode: secret };

    default:
      throw new Error(`unknown methodName ${methodName}`);
  }
};
