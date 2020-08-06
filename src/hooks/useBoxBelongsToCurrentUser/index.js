import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

export default (box) => {
  const { creator } = useSafeDestr(box);

  const currentUser = useSelector(getCurrentUserSelector);
  const { identifier } = useSafeDestr(currentUser);

  const belongsToCurrentUser = useMemo(
    () => (!isNil(identifier) && !isNil(creator)
      ? creator.identifier.value === identifier.value
      : false
    ),
    [creator, identifier],
  );

  return belongsToCurrentUser;
};
