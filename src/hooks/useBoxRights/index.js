import isNil from '@misakey/core/helpers/isNil';

import { useMemo } from 'react';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';

export default (box, propBelongsToCurrentUser) => {
  const hookBelongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const { hasAccess } = useSafeDestr(box);

  const belongsToCurrentUser = useMemo(
    () => (isNil(propBelongsToCurrentUser) ? hookBelongsToCurrentUser : propBelongsToCurrentUser),
    [propBelongsToCurrentUser, hookBelongsToCurrentUser],
  );

  const canDelete = useMemo(
    () => belongsToCurrentUser,
    [belongsToCurrentUser],
  );

  const canLeave = useMemo(
    () => !belongsToCurrentUser,
    [belongsToCurrentUser],
  );

  const canShare = useMemo(
    () => hasAccess || belongsToCurrentUser,
    [hasAccess, belongsToCurrentUser],
  );

  return useMemo(
    () => ({
      canDelete,
      canLeave,
      canShare,
    }),
    [canDelete, canLeave, canShare],
  );
};
