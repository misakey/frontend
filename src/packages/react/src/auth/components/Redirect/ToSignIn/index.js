
import useAskSigninWithHints from '@misakey/react/auth/hooks/useAskSigninWithHints';
import { useEffect } from 'react';

// CONSTANTS
const SIGN_IN_REDIRECT_CONFIG = { referrer: '/' };


// COMPONENTS
const RedirectToSignIn = () => {
  const askSigninWithHints = useAskSigninWithHints();

  useEffect(
    () => {
      askSigninWithHints(SIGN_IN_REDIRECT_CONFIG);
    },
  );

  return null;
};

export default RedirectToSignIn;
