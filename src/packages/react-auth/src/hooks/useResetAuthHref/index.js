
import isNil from '@misakey/helpers/isNil';

import { useMemo } from 'react';

// HOOKS
export default (loginChallenge) => useMemo(
  () => {
    const href = new URL(`${window.env.API_ENDPOINT}/auth/reset`);
    if (!isNil(loginChallenge)) {
      href.searchParams.set('login_challenge', loginChallenge);
    }
    return href.toString();
  },
  [loginChallenge],
);
