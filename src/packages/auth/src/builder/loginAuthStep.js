import API from '@misakey/api';

import { AUTH_STEP_KEY } from '@misakey/auth/constants/step';
import { PASSWORD_RESET_KEY, WEBAUTHN } from '@misakey/auth/constants/method';

import { makeMetadata, makePasswordReset } from '@misakey/auth/helpers/method';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';
import isNil from '@misakey/helpers/isNil';

/**
 * API call to perform authentication step in login flow
 */
export const loginAuthStepSecretInput = async ({
  loginChallenge, identityId, secret, methodName, pwdHashParams,
  [PASSWORD_RESET_KEY]: password,
  dispatchHardPasswordChange, dispatchCreateNewOwnerSecrets,
  auth = false,
}, accessToken) => {
  const metadata = await makeMetadata({
    secret,
    methodName,
    pwdHashParams,
    dispatchCreateNewOwnerSecrets,
  });

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

  const endpoint = { ...API.endpoints.auth.loginAuthStep, auth };
  const options = auth ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;

  return API.use(endpoint)
    .build(null, objectToSnakeCase(payload))
    .send(options);
};


export const loginAuthStepSecretWebAuthn = (
  { loginChallenge, identityId, metadata },
  accessToken,
) => {
  const payload = objectToSnakeCaseDeep(
    {
      loginChallenge,
      authnStep: {
        identityId,
        methodName: WEBAUTHN,
        metadata,
      },
    },
    // webauthn backend lib expects the object as it has been provided by navigator.credentials API
    { excludedKeys: ['metadata'] },
  );

  return API.use({ ...API.endpoints.auth.loginAuthStep, auth: true })
    .build(null, payload)
    .send({ headers: { Authorization: `Bearer ${accessToken}` } });
};
