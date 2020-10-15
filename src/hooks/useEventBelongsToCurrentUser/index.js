import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { senderMatchesIdentifierId } from 'helpers/sender';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// CONSTANTS
const { identifierId: IDENTIFIER_ID_SELECTOR } = authSelectors;

// HOOKS
export default (event) => {
  const { sender } = useSafeDestr(event);

  const identifierId = useSelector(IDENTIFIER_ID_SELECTOR);

  const belongsToCurrentUser = useMemo(
    () => senderMatchesIdentifierId(sender, identifierId),
    [sender, identifierId],
  );

  return belongsToCurrentUser;
};
