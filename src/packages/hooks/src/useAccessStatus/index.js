import getAccessStatus from '@misakey/helpers/getAccessStatus';

import { useMemo } from 'react';

// HOOKS
export default ({ isOwner, isSubject, isMember, autoInvite }) => useMemo(
  () => getAccessStatus({ isOwner, isSubject, isMember, autoInvite }),
  [isOwner, isSubject, isMember, autoInvite],
);
