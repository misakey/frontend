import API from '@misakey/api';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import genParams from '../passwordHashing/genParams';
import hashPassword from '../passwordHashing/hashPassword';

export default async function changePassword({ profile, oldPassword, newPassword, backupData }) {
  const { email, id: userId } = profile;

  const publicInfo = objectToCamelCase(
    await API.use(API.endpoints.user.public.read).build({ email }).send(),
  );
  const pwdHashParams = publicInfo.argon2Params;

  const payload = {
    userId,
    backupData,
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

  return API.use(API.endpoints.user.password.update).build({}, objectToSnakeCase(payload)).send();
}
