import { CLOSED, OPEN } from 'constants/app/boxes/statuses';

import isNil from '@misakey/helpers/isNil';

import { useMemo } from 'react';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';

export default (box, propBelongsToCurrentUser) => {
  const {
    lifecycle,
  } = useSafeDestr(box);

  const hookBelongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const belongsToCurrentUser = useMemo(
    () => (isNil(propBelongsToCurrentUser) ? hookBelongsToCurrentUser : propBelongsToCurrentUser),
    [propBelongsToCurrentUser, hookBelongsToCurrentUser],
  );

  const canClose = useMemo(
    () => belongsToCurrentUser && lifecycle === OPEN,
    [belongsToCurrentUser, lifecycle],
  );

  const canDelete = useMemo(
    () => belongsToCurrentUser && lifecycle === CLOSED,
    [belongsToCurrentUser, lifecycle],
  );

  const canLeave = useMemo(
    () => !belongsToCurrentUser && lifecycle !== CLOSED,
    [belongsToCurrentUser, lifecycle],
  );

  return useMemo(
    () => ({
      canClose,
      canDelete,
      canLeave,
    }),
    [canClose, canDelete, canLeave],
  );
};
