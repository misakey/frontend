import { useState, useEffect } from 'react';

export default (prop) => {
  const [prevProp, setPrevProp] = useState();

  const [propChanged, setPropChanged] = useState(false);

  useEffect(
    () => {
      if (prop !== prevProp) {
        setPropChanged(true);
        setPrevProp(prop);
      } else {
        setPropChanged(false);
      }
    },
    [prop, prevProp, setPropChanged, setPrevProp],
  );

  return propChanged;
};
