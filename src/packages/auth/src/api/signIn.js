import API from '@misakey/api';

import isEmpty from '@misakey/helpers/isEmpty';

import { CONFIRMATION_CODE_SECLEVEL, PASSWORD_SECLEVEL } from 'constants/auth';

import hashPassword from '../passwordHashing/hashPassword';
import genParams from '../passwordHashing/genParams';

/**
 * Performs the API call for authentication initialization.
 * for now the only kind of identifier we support is "email".
 */
export default async function signIn({ challenge, email, secret, acr, pwdHashParams }) {
  const payload = {
    challenge,
    identifier: {
      kind: 'email',
      value: email,
    },
    secret: {
      kind: null, // set below
      value: null, // set below
    },
  };

  if (acr === CONFIRMATION_CODE_SECLEVEL) {
    payload.secret.kind = 'confirmation_code';
  } else if (acr === PASSWORD_SECLEVEL) {
    payload.secret.kind = isEmpty(pwdHashParams) ? 'password' : 'password_hash';
  } else {
    throw Error(`Bad value for "acr": ${acr}`);
  }

  payload.secret.value = (
    (acr === PASSWORD_SECLEVEL && !isEmpty(pwdHashParams))
      ? await hashPassword({ password: secret, pwdHashParams })
      : secret
  );

  if (isEmpty(pwdHashParams) && acr === PASSWORD_SECLEVEL) {
    payload.password_hash_for_upgrade = await hashPassword({
      password: secret,
      pwdHashParams: genParams(),
    });
  }

  return API.use(API.endpoints.auth.signIn).build(null, payload).send();
}
