import API from '@misakey/api';

import { BadBackupVersion } from '@misakey/crypto/Errors/classes';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
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
  backupData,
  backupVersion,
}) => {
  const payload = {
    backupData,
    backupVersion,
    // rest of the content set below
  };

  payload.oldPrehashedPassword = await hashPassword({ password: oldPassword, pwdHashParams });

  payload.newPrehashedPassword = await hashPassword({
    password: newPassword,
    pwdHashParams: genParams(),
  });

  try {
    // note that, while "return await" is redundant outside of "try/catch"
    // and is detected as an error by ESLint,
    // it is *not* the case inside a "try/catch".
    // Here, without the "await", our "catch" block would never be executed.
    // See https://jakearchibald.com/2017/await-vs-return-vs-return-await/
    return await API
      .use(API.endpoints.accounts.password.update)
      .build({ id: accountId }, objectToSnakeCase(payload))
      .send();
  } catch (e) {
    if (e.details && (e.details.version === 'invalid')) {
      throw new BadBackupVersion();
    } else {
      throw e;
    }
  }
};
