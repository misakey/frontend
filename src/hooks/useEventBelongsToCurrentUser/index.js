import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import { senderMatchesIdentityId } from 'helpers/sender';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// HOOKS
export default (event) => {
  const { sender } = useSafeDestr(event);

  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const belongsToCurrentUser = useMemo(
    () => senderMatchesIdentityId(sender, identityId),
    [sender, identityId],
  );

  return belongsToCurrentUser;
};
