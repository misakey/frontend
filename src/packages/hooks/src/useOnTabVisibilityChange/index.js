import { useCallback, useEffect, useState } from 'react';
import isFunction from '@misakey/helpers/isFunction';
import { isTabVisible, listenForVisibilityChanges, stopListeningForVisibilityChanges } from '@misakey/helpers/visibilityChange';

export default (handler) => {
  const [isTabActive, setIsTabActive] = useState(isTabVisible());

  const onVisibilityChange = useCallback(
    () => {
      const active = isTabVisible();
      setIsTabActive(active);
      if (isFunction(handler)) {
        handler({ active });
      }
    },
    [handler],
  );

  useEffect(
    () => {
      listenForVisibilityChanges(onVisibilityChange);

      return () => {
        stopListeningForVisibilityChanges(onVisibilityChange);
      };
    },
    [onVisibilityChange],
  );

  return isTabActive;
};
