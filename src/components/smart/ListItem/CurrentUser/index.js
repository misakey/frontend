import React, { forwardRef } from 'react';
import useIdentity from '@misakey/react/auth/hooks/useIdentity';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ListItemUser from '@misakey/ui/ListItem/User';
import ListItemUserSkeleton from '@misakey/ui/ListItem/User/Skeleton';

// COMPONENTS
const ListItemCurrentUser = forwardRef((props, ref) => {
  const { identity, isFetching } = useIdentity();
  const { displayName, avatarUrl, identifierValue } = useSafeDestr(identity);

  if (isFetching) {
    return (
      <ListItemUserSkeleton ref={ref} />
    );
  }

  return (
    <ListItemUser
      ref={ref}
      displayName={displayName}
      avatarUrl={avatarUrl}
      identifier={identifierValue}
      {...props}
    />
  );
});

export default ListItemCurrentUser;
