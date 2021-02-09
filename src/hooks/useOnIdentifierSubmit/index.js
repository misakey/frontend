import authRoutes from '@misakey/react-auth/routes';

import { screenAuthSetIdentifier } from '@misakey/react-auth/store/actions/screens';
import { ssoUpdate } from '@misakey/react-auth/store/actions/sso';

import updateAuthIdentities from '@misakey/auth/builder/updateAuthIdentities';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';


export default (loginChallenge) => {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const { search } = useLocation();

  return useCallback(
    (nextIdentifier) => updateAuthIdentities({ loginChallenge, identifierValue: nextIdentifier })
      .then((response) => Promise.all([
        dispatch(ssoUpdate(response)),
        dispatch(screenAuthSetIdentifier(nextIdentifier)),
      ]))
      .then(() => {
        push({
          pathname: authRoutes.signIn.secret,
          search,
        });
      }),
    [loginChallenge, dispatch, push, search],
  );
};
