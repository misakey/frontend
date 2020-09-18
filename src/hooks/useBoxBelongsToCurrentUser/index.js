import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import { sendersMatch } from 'helpers/sender';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

export default (box) => {
  const { creator } = useSafeDestr(box);

  const currentUser = useSelector(getCurrentUserSelector);

  const belongsToCurrentUser = useMemo(
    () => sendersMatch(creator, currentUser),
    [creator, currentUser],
  );

  return belongsToCurrentUser;
};
