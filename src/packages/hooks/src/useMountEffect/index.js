import { useRef, useEffect } from 'react';

export default (fn, effects = []) => {
  const mounted = useRef(false);

  useEffect(
    () => {
      if (mounted.current === false) {
        mounted.current = true;
        return fn();
      }
      return undefined;
    },
    [fn, mounted, ...effects], // eslint-disable-line react-hooks/exhaustive-deps
  );
};
