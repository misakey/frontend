import hasHref from '@misakey/helpers/hasHref';
import eventPreventDefault from '@misakey/helpers/event/preventDefault';


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
        onAnchor(e.currentTarget);
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
