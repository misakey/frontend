
import routes from 'routes';

import useProcessRedirect from '@misakey/react-auth/hooks/useProcessRedirect';
import { useEffect } from 'react';

// CONSTANTS
const SIGN_IN_REDIRECT_CONFIG = { referrer: routes._ };


// COMPONENTS
const RedirectToSignIn = () => {
  const processRedirect = useProcessRedirect();

  useEffect(
    () => {
      processRedirect(SIGN_IN_REDIRECT_CONFIG);
    },
  );

  return null;
};

export default RedirectToSignIn;
