import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import { useMemo, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

// CONSTANTS
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
} = authSelectors;

// HOOKS
export default () => {
  const { askSigninRedirect } = useContext(UserManagerContext);
  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);
  const loginHint = useMemo(
    () => (isNil(identifierValue)
      ? ''
      : JSON.stringify({ identifier: identifierValue })),
    [identifierValue],
  );
  return useCallback(
    () => askSigninRedirect({ acrValues: 2, prompt: 'login', loginHint }),
    [askSigninRedirect, loginHint],
  );
};
