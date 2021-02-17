import isNil from '@misakey/helpers/isNil';

import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

// HOOKS
export default (condition, to, replace) => {
  const location = useLocation();

  return useMemo(
    () => {
      if (!isNil(to) || !isNil(replace)) {
        return (!condition
          ? {
          // give a to prop to Link component to avoid error,
          // but force replace to current location
            to: location,
            replace: true,
          } : {
            to,
            replace,
          });
      }
      return {};
    },
    [condition, location, to, replace],
  );
};
