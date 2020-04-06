import { useState, useRef, useEffect } from 'react';

export default (prop, effects = []) => {
  const prevProp = useRef(prop);

  const [propChanged, setPropChanged] = useState(false);

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

  return propChanged;
};
