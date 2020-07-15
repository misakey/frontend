import { useCallback, useContext } from 'react';
import { UserManagerContext } from '@misakey/auth/components/OidcProvider';

export default () => {
  const { userManager } = useContext(UserManagerContext);

  return useCallback(
    (options) => userManager.signinRedirect(options),
    [userManager],
  );
};
