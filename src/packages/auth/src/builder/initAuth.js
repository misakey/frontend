import API from '@misakey/api';

import { CONFIRMATION_CODE_SECLEVEL, PASSWORD_SECLEVEL } from '@misakey/auth/constants/seclevel';


/**
 * Performs the API call for authentication initialization.
 * for now the only kind of identifier we support is "email".
 */
// @DEPRECATED
export default async function initAuth({ challenge, email, acr, serverRelief }) {
  const payload = {
    challenge,
    identifier: {
      kind: 'email',
      value: email,
    },
    secret: {
      kind: null, // set below
    },
  };

  if (acr === CONFIRMATION_CODE_SECLEVEL) {
    payload.secret.kind = 'confirmation_code';
  } else if (acr === PASSWORD_SECLEVEL) {
    payload.secret.kind = serverRelief ? 'password_hash' : 'password';
  } else {
    throw Error(`Bad value for "acr": ${acr}`);
  }

  return API.use(API.endpoints.auth.init).build(null, payload).send();
}
