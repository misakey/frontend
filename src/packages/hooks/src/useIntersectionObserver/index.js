import { useState, useRef, useEffect } from 'react';
import isFunction from '@misakey/helpers/isFunction';

// inspired from https://medium.com/the-non-traditional-developer/how-to-use-an-intersectionobserver-in-a-react-hook-9fb061ac6cb5
export default (nodeRef, callback, shouldObserve, { root = null, rootMargin = '0px 0px 0px 0px', threshold = 0 } = {}) => {
  const [entry, updateEntry] = useState({});

  const observer = useRef(null);

  useEffect(() => {
    observer.current = ('IntersectionObserver' in window) ? new window.IntersectionObserver(
      ([firstEntry]) => {
        if (isFunction(callback)) {
          callback(firstEntry);
        }
        return updateEntry(firstEntry);
      },
      {
        root,
        rootMargin,
        threshold,
      },
    ) : null;
  }, [callback, root, rootMargin, threshold]);

  useEffect(
    () => {
      const { current: currentObserver } = observer;
      if (nodeRef && nodeRef.current && currentObserver && shouldObserve) {
        currentObserver.observe(nodeRef.current);
      }

      return () => {
        if (currentObserver) {
          currentObserver.disconnect();
        }
      };
    },
    [nodeRef, shouldObserve],
  );

  return entry;
};
