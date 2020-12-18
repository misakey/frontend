import { useRef, useEffect } from 'react';

export default () => {
  const isMountedRef = useRef();
  useEffect(
    () => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    },
    [isMountedRef],
  );

  return isMountedRef;
};
