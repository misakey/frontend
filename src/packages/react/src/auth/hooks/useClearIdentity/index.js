import { onResetSsoIdentity } from '@misakey/react/auth/store/actions/sso';
import { clearIdentity } from '@misakey/react/auth/store/actions/auth';

import { useDispatch, batch } from 'react-redux';
import { useCallback } from 'react';

// HOOKS
export default () => {
  const dispatch = useDispatch();

  return useCallback(
    () => batch(() => Promise.all([
      dispatch(onResetSsoIdentity()),
      dispatch(clearIdentity()),
    ])),
    [dispatch],
  );
};
