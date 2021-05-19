import { useMemo, useState, useCallback } from 'react';
import useIsMountedRef from '@misakey/hooks/useIsMountedRef';

export default (initialValue) => {
  const isMountedRef = useIsMountedRef();

  const [state, setState] = useState(initialValue);

  const setMountedState = useCallback(
    (nextValueOrFn) => {
      if (isMountedRef.current === true) {
        setState(nextValueOrFn);
      }
    },
    [isMountedRef, setState],
  );

  return useMemo(
    () => [state, setMountedState],
    [setMountedState, state],
  );
};
