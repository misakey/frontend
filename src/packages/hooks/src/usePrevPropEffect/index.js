import { useRef, useEffect } from 'react';

export default (prop, fn, effects = []) => {
  const prevProp = useRef(prop);

  useEffect(
    () => {
      fn(prevProp.current, prop);
      return () => {
        prevProp.current = prop;
      };
    },
    [prop, prevProp, fn, ...effects], // eslint-disable-line react-hooks/exhaustive-deps
  );
};
