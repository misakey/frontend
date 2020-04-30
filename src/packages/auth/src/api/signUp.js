import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import hashPassword from '../passwordHashing/hashPassword';
import genParams from '../passwordHashing/genParams';

export default async function signUp({
  password,
  displayName,
  email,
  handle,
  notifications,
  misakeyCrypto,
  misakeyKnow,
  tos,
  dispatchCreateNewOwnerSecrets,
}) {
  const [
    passwordHash,
    { backupData, pubkeyData },
  ] = await Promise.all([
    hashPassword({ password, pwdHashParams: genParams() }),
    dispatchCreateNewOwnerSecrets(password),
  ]);

  const payload = {
    // passed directly from input
    displayName,
    email,
    handle,
    notifications,
    misakeyCrypto,
    misakeyKnow,
    tos,
    // computed
    passwordHash,
    backupData,
    pubkeyData,
  };

  return API.use(API.endpoints.auth.signUp).build(undefined, objectToSnakeCase(payload)).send();
}
