import API from '@misakey/api';

import { PASSWORD } from '@misakey/auth/constants/method';
import { AUTH_STEP_KEY } from '@misakey/auth/constants';

import { makeMethodMetadata } from '@misakey/auth/helpers/method';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import hashPassword from '../passwordHashing/hashPassword';

/**
 * API call to perform authentication step in login flow
 */
export default async ({ loginChallenge, identityId, secret, methodName, pwdHashParams }) => {
  let metadataValue = secret;

  if (methodName === PASSWORD && !isEmpty(pwdHashParams)) {
    metadataValue = await hashPassword({ password: secret, pwdHashParams });
  }

  const metadata = makeMethodMetadata(metadataValue, methodName);

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
