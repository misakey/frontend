import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import isNil from '@misakey/helpers/isNil';

export default (content) => {
  const { kickedMember } = useMemo(() => content || {}, [content]);

  const {
    displayName: kickedUserName,
    identifier: { value: kickedIdentifier } = {},
  } = useMemo(
    () => kickedMember || {},
    [kickedMember],
  );
  const {
    identifier: { value: currentUserIdentifier },
  } = useSelector(getCurrentUserSelector) || {};

  return useMemo(() => {
    if (isNil(kickedMember)) {
      return { key: 'unknown' };
    }
    if (kickedIdentifier === currentUserIdentifier) {
      return { key: 'you' };
    }
    return {
      key: 'they',
      kickedUserName,
    };
  }, [currentUserIdentifier, kickedIdentifier, kickedMember, kickedUserName]);
};
