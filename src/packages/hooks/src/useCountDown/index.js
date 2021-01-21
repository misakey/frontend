import isNil from '@misakey/helpers/isNil';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// CONSTANTS
const DEFAULT_INTERVAL = 1000; // 1 second

// HOOKS
export default (timeToCount, interval = DEFAULT_INTERVAL) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const timer = useRef({});

  const done = useCallback(
    () => {
      timer.current = {};
      setTimeLeft(0);
    },
    [timer, setTimeLeft],
  );

  const run = useCallback(
    (timestamp) => {
      if (!timer.current.started) { // nil or 0
        timer.current.started = timestamp;
        timer.current.lastInterval = timestamp;
      }
      const localInterval = Math.min(interval, (timer.current.timeLeft || Infinity));
      if ((timestamp - timer.current.lastInterval) >= localInterval) {
        timer.current.lastInterval += localInterval;
        setTimeLeft((prevTimeLeft) => {
          const nextTimeLeft = prevTimeLeft - localInterval;
          timer.current.timeLeft = nextTimeLeft;
          return nextTimeLeft;
        });
      }
      if ((timestamp - timer.current.started < timer.current.timeToCount)) {
        timer.current.requestId = requestAnimationFrame(run);
      } else {
        done();
      }
    },
    [interval, done, setTimeLeft, timer],
  );

  const start = useCallback(
    () => {
      const { requestId } = timer.current;
      if (!isNil(requestId)) {
        cancelAnimationFrame(requestId);
      }
      timer.current.started = null;
      timer.current.lastInterval = null;
      timer.current.timeToCount = timeToCount;
      timer.current.requestId = requestAnimationFrame(run);
      setTimeLeft(timeToCount);
    },
    [run, timeToCount],
  );

  const reset = useCallback(
    () => {
      if (timer.current.timeLeft) {
        cancelAnimationFrame(timer.current.requestId);
        done();
      }
    },
    [timer, done],
  );

  useEffect(
    () => {
      reset();
    },
    [reset],
  );

  const actions = useMemo(
    () => ({ start, reset }),
    [start, reset],
  );

  return [timeLeft, actions];
};
