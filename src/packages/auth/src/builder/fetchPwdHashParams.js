import API from '@misakey/api';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

export default async function fetchPwdHashParams({ email }) {
  const publicInfo = objectToCamelCase(
    await API.use(API.endpoints.user.public.read).build({ email }).send(),
  );
  const pwdHashParams = publicInfo.argon2Params;

  return pwdHashParams;
}
