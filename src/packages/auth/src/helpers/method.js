import { SECLEVEL_METHOD, EMAILED_CODE, PREHASHED_PASSWORD, ACCOUNT_CREATION, AuthUndefinedMethodName } from '@misakey/auth/constants/method';

import hashPassword from '@misakey/auth/passwordHashing/hashPassword';
import genParams from '@misakey/auth/passwordHashing/genParams';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';

export const makeSeclevelMethod = (seclevel) => SECLEVEL_METHOD[seclevel] || EMAILED_CODE;

export const makeMetadata = async ({
  secret, methodName, pwdHashParams,
  dispatchCreateNewOwnerSecrets,
}) => {
  if (methodName === EMAILED_CODE) {
    return { code: secret };
  }

  if (methodName === PREHASHED_PASSWORD) {
    return hashPassword({ password: secret, pwdHashParams });
  }

  if (methodName === ACCOUNT_CREATION) {
    const [
      prehashedPassword,
      { backupData },
    ] = await Promise.all([
      hashPassword({ password: secret, pwdHashParams: genParams() }),
      dispatchCreateNewOwnerSecrets(secret),
    ]);
    return objectToSnakeCase({
      prehashedPassword,
      backupData,
    });
  }

  if (isNil(methodName)) {
    throw new AuthUndefinedMethodName();
  }

  throw new Error(`unknown methodName ${methodName}`);
};

export const makePasswordReset = async ({
  password,
  dispatchHardPasswordChange,
}) => {
  const [
    { backupData },
    prehashedPassword,
  ] = await Promise.all([
    dispatchHardPasswordChange(password),
    hashPassword({ password, pwdHashParams: genParams() }),
  ]);

  return {
    prehashedPassword,
    backupData,
  };
};
