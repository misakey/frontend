import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { senderMatchesIdentifierValue } from 'helpers/sender';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

// HOOKS
export default (event) => {
  const { sender } = useSafeDestr(event);

  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const belongsToCurrentUser = useMemo(
    () => senderMatchesIdentifierValue({ sender, identifierValue }),
    [sender, identifierValue],
  );

  return belongsToCurrentUser;
};
