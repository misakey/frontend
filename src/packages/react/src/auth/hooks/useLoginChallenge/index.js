import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';

import { useMemo } from 'react';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import { useSelector } from 'react-redux';

// CONSTANTS
const { loginChallenge: LOGIN_CHALLENGE_SELECTOR } = ssoSelectors;

export default () => {
  const { loginChallenge: searchLoginChallenge } = useLocationSearchParams(objectToCamelCase);
  const storeLoginChallenge = useSelector(LOGIN_CHALLENGE_SELECTOR);

  return useMemo(
    () => storeLoginChallenge || searchLoginChallenge,
    [storeLoginChallenge, searchLoginChallenge],
  );
};
