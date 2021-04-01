import hasHref from '@misakey/core/helpers/hasHref';
import eventPreventDefault from '@misakey/core/helpers/event/preventDefault';

import { useCallback, useMemo } from 'react';

// HOOKS
export default ({ onAnchor, canAnchor = true } = {}) => {
  const onContextMenu = useCallback(
    (e) => {
      if (hasHref(e.target)) {
        return;
      }
      eventPreventDefault(e);
      if (canAnchor) {
        onAnchor({
          left: e.clientX,
          top: e.clientY,
        });
      }
    },
    [onAnchor, canAnchor],
  );

  return useMemo(
    () => ({
      onContextMenu,
    }),
    [onContextMenu],
  );
};
