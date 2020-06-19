import API from '@misakey/api';

import { AUTH_STEP_KEY } from '@misakey/auth/constants';

import { makeMetadata } from '@misakey/auth/helpers/method';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

/**
 * API call to perform authentication step in login flow
 */
export default async ({ loginChallenge, identityId, secret, methodName, pwdHashParams }) => {
  const metadata = await makeMetadata({ secret, methodName, pwdHashParams });

  const payload = objectToSnakeCase({
    loginChallenge,
    [AUTH_STEP_KEY]: objectToSnakeCase({
      identityId,
      methodName,
      metadata,
    }),
  });

  return API.use(API.endpoints.auth.loginAuthStep).build(null, payload).send();
};
