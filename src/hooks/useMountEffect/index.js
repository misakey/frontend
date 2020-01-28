import { useRef, useEffect } from 'react';

export default (fn) => {
  const mounted = useRef(false);

  useEffect(
    () => {
      if (mounted.current === false) {
        mounted.current = true;
        return fn();
      }
      return undefined;
    },
    [fn, mounted],
  );
};
