import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';
import { ssoUpdate } from '@misakey/react-auth/store/actions/sso';

import { selectors } from '@misakey/react-auth/store/reducers/sso';

// HOOKS
export default () => {
  const authnStep = useSelector(selectors.getAuthnStep);
  const dispatch = useDispatch();

  return useCallback(
    () => {
      dispatch(ssoUpdate({ authnStep: { ...authnStep, methodName: PREHASHED_PASSWORD } }));
    },
    [authnStep, dispatch],
  );
};
