import { useCallback } from 'react';

import { signOut, setIsAuthenticated } from '@misakey/react-auth/store/actions/auth';
import signOutBuilder from '@misakey/auth/builder/signOut';
import { useDispatch, useSelector } from 'react-redux';
import isFunction from '@misakey/helpers/isFunction';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

export default (userManager, onSuccess = null) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const onSignOut = useCallback(
    (e) => Promise.resolve(dispatch(signOut())).then(() => {
      if (isFunction(onSuccess)) {
        Promise.resolve(onSuccess(e));
      }
    }),
    [dispatch, onSuccess],
  );

  return useCallback(
    () => {
      if (isAuthenticated) {
        // User to prevent component to refetch as token is still
        // in store but have already been invalidateed in backend
        dispatch(setIsAuthenticated(false));
        return signOutBuilder()
          .then(() => userManager.removeUser())
          .then(onSignOut);
      }
      // Clear identity and other fields if needed
      return onSignOut();
    },
    [dispatch, isAuthenticated, onSignOut, userManager],
  );
};
