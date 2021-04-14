import isNil from '@misakey/core/helpers/isNil';

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

// HOOKS
export default (prop, equalFn = null, effects = []) => {
  const prevProp = useRef(prop);

  const [propChanged, setPropChanged] = useState(false);

  const reset = useCallback(
    () => {
      setPropChanged(false);
    },
    [setPropChanged],
  );

  const propEqualPrev = useCallback(
    (current, prev) => (isNil(equalFn)
      ? current === prev
      : equalFn(current, prev)),
    [equalFn],
  );

  useEffect(
    () => {
      if (!propEqualPrev(prop, prevProp.current)) {
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
