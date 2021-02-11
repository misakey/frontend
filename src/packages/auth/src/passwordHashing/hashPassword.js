import { encodeBase64 } from 'tweetnacl-util';

import isEmpty from '@misakey/helpers/isEmpty';

const PWD_HASH_LENGTH = 16;

export default async function hashPassword({ password, pwdHashParams }) {
  if (isEmpty(password)) { throw Error('cannot hash empty password'); }
  if (isEmpty(window.argon2)) { throw Error('Argon2 not available, cannot hash password'); }

  // more reliable access to salt base 64
  const salt = pwdHashParams.saltBase64 || pwdHashParams.salt_base_64;

  const {
    iterations: time,
    memory: mem,
  } = pwdHashParams;

  const params = {
    pass: password,
    salt,
    time,
    mem,
    hashLen: PWD_HASH_LENGTH,
    type: window.argon2.ArgonType.Argon2i,
  };

  const argon2Result = await window.argon2.hash(params);

  return {
    hash_base_64: encodeBase64(argon2Result.hash),
    params: pwdHashParams,
  };
}
