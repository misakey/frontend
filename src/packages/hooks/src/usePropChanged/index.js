import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

export default (prop, effects = []) => {
  const prevProp = useRef(prop);

  const [propChanged, setPropChanged] = useState(false);

  const reset = useCallback(
    () => {
      setPropChanged(false);
    },
    [setPropChanged],
  );

  useEffect(
    () => {
      if (prop !== prevProp.current) {
        setPropChanged(true);
        prevProp.current = prop;
      } else {
        setPropChanged(false);
      }
    },
    [prop, prevProp, setPropChanged, ...effects], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return useMemo(
    () => [propChanged, reset],
    [propChanged, reset],
  );
};
