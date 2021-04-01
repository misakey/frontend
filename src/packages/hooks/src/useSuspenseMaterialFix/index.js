import { useRef, useState, useEffect, useCallback } from 'react';

import useMountEffect from '@misakey/hooks/useMountEffect';

import log from '@misakey/core/helpers/log';

// CONSTANTS
const USE_WARNING = 'WARNING: useSuspenseMaterialFix was triggered, it can cause infinite refresh loops';

export default (shouldBeVisible = true) => {
  const ref = useRef();
  const [remount, setRemount] = useState(0);

  const refresh = useCallback(
    () => setRemount((rem) => rem + 1),
    [setRemount],
  );

  // @FIXME find a better way to handle this bug
  useEffect(
    () => {
      if (ref.current && shouldBeVisible && ref.current.offsetWidth === 0) {
        refresh();
      }
    }, // NB: there is voluntarily no deps on this hook to be triggered on each render
  );

  useMountEffect(
    () => {
      log(USE_WARNING, 'warn');
    },
  );

  return { ref, key: remount };
};
