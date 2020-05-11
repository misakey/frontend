import API from '@misakey/api';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import { BadBackupVersion } from '@misakey/crypto/Errors/classes';

import genParams from '../passwordHashing/genParams';
import hashPassword from '../passwordHashing/hashPassword';

export default async function changePassword({
  profile,
  oldPassword,
  newPassword,
  backupData,
  backupVersion,
}) {
  const { email, id: userId } = profile;

  const publicInfo = objectToCamelCase(
    await API.use(API.endpoints.user.public.read).build({ email }).send(),
  );
  const pwdHashParams = publicInfo.argon2Params;

  const payload = {
    userId,
    backupData,
    backupVersion,
    // rest of the content set below
  };

  if (isEmpty(pwdHashParams)) {
    payload.oldPassword = oldPassword;
  } else {
    payload.oldPasswordHash = await hashPassword({ password: oldPassword, pwdHashParams });
  }

  payload.newPasswordHash = await hashPassword({
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
      .use(API.endpoints.user.password.update)
      .build({}, objectToSnakeCase(payload))
      .send();
  } catch (e) {
    if (e.details && (e.details.version === 'invalid')) {
      throw new BadBackupVersion();
    } else {
      throw e;
    }
  }
}
