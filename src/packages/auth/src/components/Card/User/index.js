import React from 'react';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import path from '@misakey/helpers/path';

import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useModifier from '@misakey/hooks/useModifier';

import CardUser from '@misakey/ui/Card/User';

// CONSTANTS
const { identity: IDENTITY_SELECTOR, expiresAt: EXPIRES_AT_SELECTOR } = authSelectors;

// HELPERS
const identifierValuePath = path(['identifier', 'value']);

// COMPONENTS
const CardUserAuth = (props) => {
  const identity = useSelector(IDENTITY_SELECTOR);
  const { displayName, avatarUrl } = useSafeDestr(identity);
  const identifierValue = useModifier(identifierValuePath, identity);
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
