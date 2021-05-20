import { receiveOrganizations } from 'store/reducers/identity/organizations';

import { listOrganizations } from '@misakey/core/api/helpers/builder/identities';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

// HOOKS
export default (identityId) => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const dispatchReceiveOrganizations = useCallback(
    (orgs) => Promise.resolve(
      dispatch(receiveOrganizations(orgs, identityId)),
    ),
    [dispatch, identityId],
  );

  return useCallback(
    () => listOrganizations(identityId)
      .then(dispatchReceiveOrganizations)
      .catch(handleHttpErrors),
    [dispatchReceiveOrganizations, handleHttpErrors, identityId],
  );
};
