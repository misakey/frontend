import { useRef, useCallback, useEffect } from 'react';

/**
 * @param {Function} fn receive onDone callback as param
 * This effect hook gives you control on when it should stop running the function passed
 * Trigger onDone callback
 * It is an upgrade based on useMountEffect, which depends on lifecycle
 * When depending on api calls, mount is often not the right moment to trigger an effect
 * This hook's design is to externalize the synchro responsibility
 * It is also an alternative design to the `shouldFetch` logic,
 * This way you can have much more complex behaviours
 */
export default (fn) => {
  const done = useRef(false);

  const onDone = useCallback(
    () => {
      done.current = true;
    },
    [done],
  );

  useEffect(
    () => {
      if (done.current === false) {
        return fn(onDone);
      }
      return undefined;
    },
    [fn, done, onDone],
  );
};
