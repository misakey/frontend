import { useCallback } from 'react';

import { onResetSsoIdentity } from '@misakey/react/auth/store/actions/sso';
import { clearIdentity } from '@misakey/react/auth/store/actions/auth';

import authRoutes from '@misakey/react/auth/routes';

import { useDispatch, batch } from 'react-redux';

import { useHistory } from 'react-router-dom';

// HOOKS
export const useClearUser = () => {
  const dispatch = useDispatch();
  const { push } = useHistory();

  return useCallback(
    () => batch(() => Promise.all([
      dispatch(onResetSsoIdentity()),
      dispatch(clearIdentity()),
    ]))
      .then(() => {
        push(authRoutes.signIn._);
      }),
    [dispatch, push],
  );
};
