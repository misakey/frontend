import API from '@misakey/api';

import { AUTH_STEP_KEY } from '@misakey/auth/constants';
import { PASSWORD_RESET_KEY } from '@misakey/auth/constants/method';

import { makeMetadata, makePasswordReset } from '@misakey/auth/helpers/method';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';


/**
 * API call to perform authentication step in login flow
 */
export default async ({
  loginChallenge, identityId, secret, methodName, pwdHashParams,
  [PASSWORD_RESET_KEY]: password, dispatchHardPasswordChange,
}) => {
  const metadata = await makeMetadata({ secret, methodName, pwdHashParams });

  const payload = {
    loginChallenge,
    [AUTH_STEP_KEY]: objectToSnakeCase({
      identityId,
      methodName,
      metadata,
    }),
  };

  if (!isNil(password)) {
    const passwordReset = await makePasswordReset({ password, dispatchHardPasswordChange });

    payload[PASSWORD_RESET_KEY] = objectToSnakeCase(passwordReset);
  }

  return API.use(API.endpoints.auth.loginAuthStep).build(null, objectToSnakeCase(payload)).send();
};
