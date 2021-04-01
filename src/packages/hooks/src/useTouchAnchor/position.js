import head from '@misakey/core/helpers/head';
import hasHref from '@misakey/core/helpers/hasHref';
import path from '@misakey/core/helpers/path';
import eventPreventDefault from '@misakey/core/helpers/event/preventDefault';

import { useMemo, useCallback, useRef } from 'react';

// HELPERS
const touchRefTargetPath = path(['current', 'target']);

// HOOKS
export default ({ onAnchor, canAnchor = true } = {}) => {
  const touchRef = useRef();

  const onTouchStart = useCallback(
    (e) => {
      const { target, touches } = e;
      if (hasHref(target) || touches.length > 1) {
        return;
      }
      if (canAnchor) {
        touchRef.current = head(touches);
      }
    },
    [touchRef, canAnchor],
  );

  const onTouchMove = useCallback(
    () => {
      touchRef.current = undefined;
    },
    [touchRef],
  );

  const onTouchEnd = useCallback(
    (e) => {
      const { target } = e;
      const touchRefTarget = touchRefTargetPath(touchRef);
      if (hasHref(target) || target !== touchRefTarget) {
        return;
      }
      eventPreventDefault(e);
      const { current } = touchRef;
      onAnchor({
        left: current.clientX,
        top: current.clientY,
      });
    },
    [onAnchor, touchRef],
  );

  return useMemo(
    () => ({
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    }),
    [onTouchStart, onTouchMove, onTouchEnd],
  );
};
