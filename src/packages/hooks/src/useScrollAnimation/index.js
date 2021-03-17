import { useRef, useState, useCallback } from 'react';

export default (timeout = 300) => {
  const timeoutRef = useRef();

  const [isScrolling, setIsScrolling] = useState(false);

  const onScroll = useCallback(
    () => {
      requestAnimationFrame(
        () => {
          setIsScrolling(true);
          const { current } = timeoutRef;
          if (current) {
            clearTimeout(current);
          }
          timeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
          }, timeout);
        },
      );
    },
    [setIsScrolling, timeoutRef, timeout],
  );

  return [isScrolling, onScroll];
};
