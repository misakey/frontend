import { useRef, useEffect } from 'react';

import isFunction from '@misakey/core/helpers/isFunction';
import isNil from '@misakey/core/helpers/isNil';

export default (...refs) => {
  const combinedRef = useRef();

  useEffect(
    () => {
      refs.forEach((ref) => {
        if (isNil(ref)) {
          return;
        }
        if (isFunction(ref)) {
          ref(combinedRef.current);
        } else {
          // eslint-disable-next-line no-param-reassign
          ref.current = combinedRef.current;
        }
      });
    },
    [refs],
  );

  return combinedRef;
};
