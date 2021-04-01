import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { userIdentityUpdate } from '@misakey/react-auth/store/actions/identity/account';
import { useHistory } from 'react-router-dom';
import isNil from '@misakey/core/helpers/isNil';

export default ({ identityId, homePath }) => {
  const { push } = useHistory();
  const dispatch = useDispatch();

  return useCallback(
    (changes) => Promise.resolve(dispatch(userIdentityUpdate(identityId, changes)))
      .then(() => {
        if (!isNil(homePath)) {
          return push(homePath);
        }
        return undefined;
      }),
    [dispatch, homePath, identityId, push],
  );
};
