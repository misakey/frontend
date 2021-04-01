import isFunction from '@misakey/core/helpers/isFunction';
import update from '@misakey/core/helpers/update';

import { useState, useMemo, useEffect, useCallback } from 'react';

// HOOKS
// inspired from https://medium.com/the-non-traditional-developer/how-to-use-an-intersectionobserver-in-a-react-hook-9fb061ac6cb5
export default (nodes, callback, { shouldObserve = true, shouldBind = true } = {}, { rootRef = null, rootMargin = '0px 0px 0px 0px', threshold = 0 } = {}) => {
  const [entries, updateEntries] = useState({});

  const updateEntry = useCallback(
    (index, nextEntry) => updateEntries((prevEntries) => update(index, nextEntry, prevEntries)),
    [updateEntries],
  );

  const observers = useMemo(
    () => [],
    [],
  );

  useEffect(() => {
    if (shouldBind) {
      nodes.forEach((_, index) => {
        observers[index] = ('IntersectionObserver' in window) ? new window.IntersectionObserver(
          ([firstEntry]) => {
            if (isFunction(callback)) {
              callback(firstEntry, index);
            }
            return updateEntry(index, firstEntry);
          },
          {
            root: rootRef.current,
            rootMargin,
            threshold,
          },
        ) : null;
      });
    }
  }, [shouldBind, nodes, observers, callback, rootRef, rootMargin, threshold, updateEntry]);

  useEffect(
    () => {
      nodes.forEach((node, index) => {
        const observer = observers[index];
        if (node && observer && shouldObserve) {
          observer.observe(node);
        }

        return () => {
          if (observer) {
            observer.disconnect();
          }
        };
      });
    },
    [observers, nodes, shouldObserve],
  );

  return entries;
};
