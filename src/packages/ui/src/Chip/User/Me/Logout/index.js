import React, { useContext } from 'react';


import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { UserManagerContext } from '@misakey/react-auth/components/OidcProvider/Context';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSelector } from 'react-redux';

import ChipUser from '@misakey/ui/Chip/User';

// CONSTANTS
const { identity: IDENTITY_SELECTOR } = authSelectors;


// COMPONENTS
// @UNUSED
const ChipUserMeLogout = (props) => {
  const { onSignOut: onDelete } = useContext(UserManagerContext);

  const identity = useSelector(IDENTITY_SELECTOR);
  const { displayName, avatarUrl } = useSafeDestr(identity);

  return (
    <ChipUser
      displayName={displayName}
      avatarUrl={avatarUrl}
      onDelete={onDelete}
      {...props}
    />
  );
};

export default ChipUserMeLogout;
