import { useCallback } from 'react';

import { signOut, setIsAuthenticated } from '@misakey/auth/store/actions/auth';
import signOutBuilder from '@misakey/auth/builder/signOut';
import { useDispatch } from 'react-redux';
import isFunction from '@misakey/helpers/isFunction';

export default (userManager, onSuccess = null) => {
  const dispatch = useDispatch();

  return useCallback(
    (e) => {
      // User to prevent component to refetch as token is still
      // in store but have already been invalidateed in backend
      dispatch(setIsAuthenticated(false));
      return signOutBuilder()
        .then(() => userManager.removeUser())
        .then(() => Promise.resolve(dispatch(signOut(e))))
        .then(() => {
          if (isFunction(onSuccess)) {
            Promise.resolve(onSuccess(e));
          }
        });
    },
    [dispatch, onSuccess, userManager],
  );
};
