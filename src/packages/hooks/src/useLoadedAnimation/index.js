import { useState, useMemo, useEffect } from 'react';

import usePrevPropEffect from '@misakey/hooks/usePrevPropEffect';
import { isNil } from 'lodash-es';

// CONSTANTS
const DEFAULT_TIMEOUT = 300;

// HOOKS
export default (isLoading, timeout = DEFAULT_TIMEOUT) => {
  const [done, setDone] = useState();

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

  useEffect(
    () => {
      if (isLoading) {
        setDone(false);
      }
    },
    [setDone, isLoading],
  );

  return useMemo(
    () => (isNil(done) || isLoading ? !isLoading : done),
    [done, isLoading],
  );
};
