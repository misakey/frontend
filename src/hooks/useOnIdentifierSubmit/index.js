import routes from 'routes';

import { screenAuthSetIdentifier } from 'store/actions/screens/auth';
import { ssoUpdate } from '@misakey/auth/store/actions/sso';

import updateAuthIdentities from '@misakey/auth/builder/updateAuthIdentities';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';


export default (loginChallenge) => {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const { search } = useLocation();

  return useCallback(
    (nextIdentifier) => updateAuthIdentities(loginChallenge, nextIdentifier)
      .then((response) => Promise.all([
        dispatch(ssoUpdate(response)),
        dispatch(screenAuthSetIdentifier(nextIdentifier)),
      ]))
      .then(() => {
        push({
          pathname: routes.auth.signIn.secret,
          search,
        });
      }),
    [loginChallenge, dispatch, push, search],
  );
};
