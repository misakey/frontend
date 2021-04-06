import { useState, useMemo } from 'react';

import usePrevPropEffect from '@misakey/hooks/usePrevPropEffect';

// CONSTANTS
const DEFAULT_TIMEOUT = 300;

// HOOKS
export default (isLoading, timeout = DEFAULT_TIMEOUT) => {
  const [done, setDone] = useState(false);

  usePrevPropEffect(isLoading,
    (prevLoading, nextLoading) => {
      if (prevLoading && !nextLoading) {
        setTimeout(
          () => {
            setDone(true);
          },
          timeout,
        );
      }
    },
    [setDone]);

  return useMemo(
    () => (isLoading ? !isLoading : done),
    [done, isLoading],
  );
};
