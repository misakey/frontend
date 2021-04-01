
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { addOrganization } from 'store/reducers/identity/organizations';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// HOOKS
export default () => {
  const dispatch = useDispatch();
  const meIdentityId = useSelector(IDENTITY_ID_SELECTOR);

  return useCallback(
    (organization) => Promise.resolve(dispatch(addOrganization(meIdentityId, organization))),
    [dispatch, meIdentityId],
  );
};
