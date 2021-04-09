import API from '@misakey/core/api';

import { AUTH_STEP_KEY } from '@misakey/core/auth/constants/step';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';

/**
 * API call to perform authentication step in login flow
 */
export default async ({ loginChallenge, identityId, methodName }) => {
  const payload = objectToSnakeCase({
    loginChallenge,
    [AUTH_STEP_KEY]: objectToSnakeCase({
      identityId,
      methodName,
    }),
  });

  return API.use(API.endpoints.auth.initAuthStep).build(null, payload).send();
};
