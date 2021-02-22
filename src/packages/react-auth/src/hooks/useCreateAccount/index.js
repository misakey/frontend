import { useCallback } from 'react';
import useAskSigninWithLoginHint from '../useAskSigninWithLoginHint';

// HOOKS
export default () => {
  const askSigninWithLoginHint = useAskSigninWithLoginHint();

  return useCallback(
    () => askSigninWithLoginHint({ acrValues: 2, prompt: 'login' }),
    [askSigninWithLoginHint],
  );
};
