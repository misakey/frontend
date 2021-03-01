import API from '@misakey/api';

import { AUTH_STEP_KEY } from '@misakey/auth/constants/step';
import { WEBAUTHN, TOTP_RECOVERY, TOTP } from '@misakey/auth/constants/method';

import { makeMetadata } from '@misakey/auth/helpers/method';
import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';

/**
 * API call to perform authentication step in login flow
 */
export const loginAuthStepBuilder = async ({
  loginChallenge, identityId, secret, methodName, pwdHashParams,
  dispatchHardPasswordChange, dispatchCreateNewOwnerSecrets,
}) => {
  const metadata = await makeMetadata({
    secret,
    methodName,
    pwdHashParams,
    dispatchCreateNewOwnerSecrets,
    dispatchHardPasswordChange,
  });

  // TOTP_RECOVERY doesn't exist in backend,
  // it's methodName: TOTP + `recovery_code` in metadata instead of `code`
  const apiMethodName = methodName === TOTP_RECOVERY ? TOTP : methodName;

  const excludedKeys = methodName === WEBAUTHN ? ['metadata'] : undefined;

  const payload = objectToSnakeCaseDeep(
    { loginChallenge, [AUTH_STEP_KEY]: { identityId, methodName: apiMethodName, metadata } },
    // // webauthn backend lib expects the object as it has been provided
    // // by navigator.credentials API
    { excludedKeys, ignoreBase64: true },
  );

  return API.use(API.endpoints.auth.loginAuthStep).build(null, payload).send();
};
