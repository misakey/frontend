import { useMemo } from 'react';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import isNil from '@misakey/core/helpers/isNil';

import { IDENTITY_EMAILED_CODE, IDENTITY_PASSWORD, WEBAUTHN } from '@misakey/core/auth/constants/amr';

import useInitAuthStep from '.';

// CONSTANTS
const REQUIRE_PREPARED_METADATA = [
  // need to get pwdHashParams from backend
  IDENTITY_PASSWORD,
  // need to send a code by email in backend
  IDENTITY_EMAILED_CODE,
  // need to get metadata from backend
  WEBAUTHN,
];


// HOOKS
export default (loginChallenge, identityId, methodName, methodMetadata) => {
  const onInitAuthStep = useInitAuthStep(
    { loginChallenge, identityId, methodName },
    { disableSnackbar: true },
  );

  const shouldFetch = useMemo(
    () => REQUIRE_PREPARED_METADATA.includes(methodName) && isNil(methodMetadata),
    [methodMetadata, methodName],
  );

  return useFetchEffect(onInitAuthStep, { shouldFetch });
};
