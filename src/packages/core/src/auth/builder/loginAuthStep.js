import API from '@misakey/core/api';

import { AUTH_STEP_KEY } from '@misakey/core/auth/constants/step';
import { WEBAUTHN } from '@misakey/core/auth/constants/amr';

import objectToSnakeCaseDeep from '@misakey/core/helpers/objectToSnakeCaseDeep';

/**
 * API call to perform authentication step in login flow
 */
export const loginAuthStepBuilder = async ({
  loginChallenge, identityId, metadata, methodName,
}) => {
  const excludedKeys = methodName === WEBAUTHN ? ['metadata'] : undefined;

  const payload = objectToSnakeCaseDeep(
    { loginChallenge, [AUTH_STEP_KEY]: { identityId, methodName, metadata } },
    // webauthn backend lib expects the object as it has been provided
    // by navigator.credentials API
    { excludedKeys, ignoreBase64: true },
  );

  return API.use(API.endpoints.auth.loginAuthStep).build(null, payload).send();
};
