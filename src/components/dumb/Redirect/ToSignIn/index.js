
import routes from 'routes';

import useAskSigninWithLoginHint from '@misakey/react-auth/hooks/useAskSigninWithLoginHint';
import { useEffect } from 'react';

// CONSTANTS
const SIGN_IN_REDIRECT_CONFIG = { referrer: routes._ };


// COMPONENTS
const RedirectToSignIn = () => {
  const askSigninWithLoginHint = useAskSigninWithLoginHint();

  useEffect(
    () => {
      askSigninWithLoginHint(SIGN_IN_REDIRECT_CONFIG);
    },
  );

  return null;
};

export default RedirectToSignIn;
