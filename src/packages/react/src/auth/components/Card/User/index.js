import React from 'react';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import CardUser from '@misakey/ui/Card/User';

// CONSTANTS
const { identity: IDENTITY_SELECTOR, expiresAt: EXPIRES_AT_SELECTOR } = authSelectors;

// COMPONENTS
const CardUserAuth = (props) => {
  const identity = useSelector(IDENTITY_SELECTOR);
  const { displayName, avatarUrl, identifierValue } = useSafeDestr(identity);
  const expiresAt = useSelector(EXPIRES_AT_SELECTOR);

  return (
    <CardUser
      avatarUrl={avatarUrl}
      displayName={displayName}
      identifier={identifierValue}
      expiresAt={expiresAt}
      {...props}
    />
  );
};

export default CardUserAuth;
