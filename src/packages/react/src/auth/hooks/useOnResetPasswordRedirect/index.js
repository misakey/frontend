import { useCallback, useContext } from 'react';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

export default ({ loginHint, referrer }) => {
  const { userManager } = useContext(UserManagerContext);

  return useCallback(
    () => {
      userManager.signinRedirect({
        loginHint,
        misakeyCallbackHints: { resetPassword: true },
        referrer,
      });
    },
    [loginHint, referrer, userManager],
  );
};
