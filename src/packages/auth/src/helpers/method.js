import { SECLEVEL_METHOD, EMAILED_CODE, PREHASHED_PASSWORD, ACCOUNT_CREATION, AuthUndefinedMethodName, RESET_PASSWORD, WEBAUTHN, TOTP, TOTP_RECOVERY } from '@misakey/auth/constants/method';

import hashPassword from '@misakey/auth/passwordHashing/hashPassword';
import genParams from '@misakey/auth/passwordHashing/genParams';
import isNil from '@misakey/helpers/isNil';
import {
  accountCreationSecretStoragePayload,
  passwordResetSecretStoragePayload,
} from '@misakey/crypto';

export const makeSeclevelMethod = (seclevel) => SECLEVEL_METHOD[seclevel] || EMAILED_CODE;

export const makeMetadata = async ({
  secret, methodName, pwdHashParams,
}) => {
  if (isNil(methodName)) {
    throw new AuthUndefinedMethodName();
  }

  switch (methodName) {
    case EMAILED_CODE:
      return { code: secret };
    case PREHASHED_PASSWORD:
      return hashPassword({ password: secret, pwdHashParams });
    case ACCOUNT_CREATION: {
      const [prehashedPassword, secretStorage] = await Promise.all([
        hashPassword({ password: secret, pwdHashParams: genParams() }),
        accountCreationSecretStoragePayload(secret),
      ]);

      return {
        prehashedPassword,
        secretStorage,
      };
    }
    case RESET_PASSWORD: {
      const [secretStorage, prehashedPassword] = await Promise.all([
        passwordResetSecretStoragePayload(secret),
        hashPassword({ password: secret, pwdHashParams: genParams() }),
      ]);

      return {
        prehashedPassword,
        secretStorage,
      };
    }
    case WEBAUTHN:
      return secret;
    case TOTP:
      return { code: secret };
    case TOTP_RECOVERY:
      return { recoveryCode: secret };

    default:
      throw new Error(`unknown methodName ${methodName}`);
  }
};
