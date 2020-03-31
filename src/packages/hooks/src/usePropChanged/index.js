import { useState, useRef, useEffect } from 'react';

export default (prop) => {
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
    [prop, prevProp, setPropChanged],
  );

  return propChanged;
};
