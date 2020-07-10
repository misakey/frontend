import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { userIdentityUpdate } from 'store/actions/screens/account';
import { useHistory } from 'react-router-dom';

export default ({ identityId, homePath }) => {
  const { push } = useHistory();
  const dispatch = useDispatch();

  return useCallback(
    (changes) => Promise.resolve(dispatch(userIdentityUpdate(identityId, changes)))
      .then(() => push(homePath)),
    [dispatch, homePath, identityId, push],
  );
};
