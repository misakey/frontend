import API from '@misakey/core/api';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import hashPassword from '../passwordHashing/hashPassword';
import genParams from '../passwordHashing/genParams';

export const fetchPwdHashParams = (accountId) => API
  .use(API.endpoints.accounts.passwordParams.read)
  .build({ id: accountId })
  .send();

export const changePassword = async ({
  oldPassword,
  newPassword,
  pwdHashParams,
  accountId,
  encryptedAccountRootKey,
}) => {
  const payload = {
    encryptedAccountRootKey,
    // rest of the content set below
  };

  payload.oldPrehashedPassword = await hashPassword({ password: oldPassword, pwdHashParams });

  payload.newPrehashedPassword = await hashPassword({
    password: newPassword,
    pwdHashParams: genParams(),
  });

  return API
    .use(API.endpoints.accounts.password.update)
    .build({ id: accountId }, objectToSnakeCase(payload))
    .send();
};
