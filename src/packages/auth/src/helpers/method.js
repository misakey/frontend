import { SECLEVEL_METHOD, EMAILED_CODE, PREHASHED_PASSWORD } from '@misakey/auth/constants/method';

import hashPassword from '@misakey/auth/passwordHashing/hashPassword';
import genParams from '@misakey/auth/passwordHashing/genParams';

export const makeSeclevelMethod = (seclevel) => SECLEVEL_METHOD[seclevel] || EMAILED_CODE;

export const makeMetadata = ({ secret, methodName, pwdHashParams }) => {
  if (methodName === EMAILED_CODE) {
    return { code: secret };
  }

  if (methodName === PREHASHED_PASSWORD) {
    return hashPassword({ password: secret, pwdHashParams });
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
