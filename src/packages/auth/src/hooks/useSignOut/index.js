import { useCallback } from 'react';

import { signOut } from '@misakey/auth/store/actions/auth';
import signOutBuilder from '@misakey/auth/builder/signOut';
import { useDispatch } from 'react-redux';

export default (userManager) => {
  const dispatch = useDispatch();
  return useCallback(
    (e) => signOutBuilder()
      .then(() => userManager.removeUser())
      .then(() => Promise.resolve(dispatch(signOut(e)))),
    [dispatch, userManager],
  );
};
