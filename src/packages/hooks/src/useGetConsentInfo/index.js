import { getInfo } from '@misakey/core/auth/builder/consent';
import { ssoUpdate } from '@misakey/react-auth/store/actions/sso';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export default (consentChallenge) => {
  const dispatch = useDispatch();

  return useCallback(
    () => getInfo({ consentChallenge })
      .then(
        (response) => Promise.resolve(dispatch(ssoUpdate(response))),
      ),
    [consentChallenge, dispatch],
  );
};
