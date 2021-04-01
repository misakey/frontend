import throttle from '@misakey/core/helpers/throttle';
import { isNil } from 'lodash-es';

import { useMemo, useEffect } from 'react';

// HOOKS
export default (ref, fn, delay = 300) => {
  const onScroll = useMemo(
    () => throttle(fn, delay),
    [fn, delay],
  );

  useEffect(
    () => {
      const { current } = ref;
      if (!isNil(current)) {
        try {
          current.addEventListener('scroll', onScroll, { passive: true });
        } catch (e) {
          // fallback for older browsers not supporting options
          current.addEventListener('scroll', onScroll);
        }
      }
      return () => {
        if (!isNil(current)) {
          current.removeEventListener('scroll', onScroll);
        }
      };
    },
    [ref, onScroll],
  );
};
