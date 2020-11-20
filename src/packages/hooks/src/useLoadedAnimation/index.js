import { useState } from 'react';

import usePrevPropEffect from '@misakey/hooks/usePrevPropEffect';

// CONSTANTS
const DEFAULT_TIMEOUT = 300;

// HOOKS
export default (isLoading, timeout = DEFAULT_TIMEOUT) => {
  const [done, setDone] = useState(true);

  usePrevPropEffect(isLoading,
    (prevLoading, nextLoading) => {
      if (prevLoading && !nextLoading) {
        setDone(false);
        setTimeout(
          () => {
            setDone(true);
          },
          timeout,
        );
      }
    },
    [setDone]);

  return done;
};
