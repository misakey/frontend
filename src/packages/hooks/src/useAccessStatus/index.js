import getAccessStatus from '@misakey/helpers/getAccessStatus';

import { useMemo } from 'react';

// HOOKS
export default ({ isOwner, isMember, autoInvite }) => useMemo(
  () => getAccessStatus({ isOwner, isMember, autoInvite }),
  [isOwner, isMember, autoInvite],
);
