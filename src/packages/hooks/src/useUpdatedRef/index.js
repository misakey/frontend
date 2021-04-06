import { useRef, useEffect } from 'react';

export default (target, deps = []) => {
  const ref = useRef(target);

  useEffect(
    () => {
      ref.current = target;
    },
    [target, ...deps], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return ref;
};
