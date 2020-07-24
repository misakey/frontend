import API from '@misakey/api';

import { AUTH_STEP_KEY } from '@misakey/auth/constants/step';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

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

  return API.use(API.endpoints.auth.renewAuthStep).build(null, payload).send();
};
