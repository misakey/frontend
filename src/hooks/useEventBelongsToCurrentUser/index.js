import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

export default (event) => {
  const { sender } = useSafeDestr(event);

  const currentUser = useSelector(getCurrentUserSelector);
  const { identifier } = useSafeDestr(currentUser);

  const belongsToCurrentUser = useMemo(
    () => (!isNil(identifier) && !isNil(sender)
      ? sender.identifier.value === identifier.value
      : false
    ),
    [sender, identifier],
  );

  return belongsToCurrentUser;
};
