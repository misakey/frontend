import { useCallback, useContext } from 'react';
import { UserManagerContext } from '@misakey/react-auth/components/OidcProvider/Context';

export default (canCancel = true) => {
  const { askSigninRedirect } = useContext(UserManagerContext);

  return useCallback(
    (options) => askSigninRedirect(options, canCancel),
    [askSigninRedirect, canCancel],
  );
};
