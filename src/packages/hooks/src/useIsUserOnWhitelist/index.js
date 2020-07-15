import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import pathOr from '@misakey/helpers/pathOr';

// HOOKS
export default () => {
  const currentUser = useSelector(getCurrentUserSelector) || {};
  const identifier = useMemo(
    () => pathOr('', ['identifier', 'value'], currentUser),
    [currentUser],
  );

  return useMemo(
    () => {
      if (window.env.WHITELIST.emails.includes(identifier)) {
        return true;
      }
      if (window.env.WHITELIST.domains.includes(identifier.split('@')[1])) {
        return true;
      }
      return false;
    },
    [identifier],
  );
};
