import React, { useMemo, useCallback, useEffect, useRef } from 'react';


import isNil from '@misakey/helpers/isNil';
import exponentialBackoff from '@misakey/helpers/exponentialBackoff';

import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import SnackbarActionRetry from '@misakey/ui/Snackbar/Action/Retry';
import SnackbarActionRefresh from '@misakey/ui/Snackbar/Action/Refresh';

// CONSTANTS
const NOTIFICATION_COUNT = 4;
const MAX_RETRY_COUNT = 5;

// HOOK
export default () => {
  const attempt = useRef(0);
  const timeoutRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');
  const tRef = useRef(t);

  const killTimeout = useCallback(
    () => {
      const { current } = timeoutRef;
      if (!isNil(current)) {
        clearTimeout(current);
      }
    },
    [timeoutRef],
  );

  const onRetry = useCallback(
    (fn) => {
      killTimeout();
      fn();
    },
    [killTimeout],
  );

  const onExponentialBackoff = useCallback(
    (fn) => {
      const { current } = attempt;
      if (current < MAX_RETRY_COUNT) {
        const delay = exponentialBackoff(current);
        if (current >= NOTIFICATION_COUNT) {
          const text = tRef.current('common:error.retry', { delay: delay / 1000 });
          enqueueSnackbar(text, {
            variant: 'warning',
            preventDuplicate: true,
            action: (key) => <SnackbarActionRetry id={key} fn={fn} onClick={onRetry} /> });
        }
        attempt.current += 1;
        timeoutRef.current = setTimeout(
          () => {
            fn();
          },
          delay,
        );
      } else {
        const text = tRef.current('common:error.stop', { count: MAX_RETRY_COUNT });
        enqueueSnackbar(text, {
          variant: 'error',
          preventDuplicate: true,
          persist: true,
          action: (key) => <SnackbarActionRefresh id={key} />,
        });
      }
    },
    [tRef, enqueueSnackbar, onRetry],
  );

  const reset = useCallback(
    () => {
      attempt.current = 0;
      killTimeout();
    },
    [attempt, killTimeout],
  );

  // cleanup effect
  useEffect(
    () => {
      attempt.current = 0;
      return killTimeout;
    },
    [killTimeout, attempt],
  );

  // rebind effect
  useEffect(
    () => {
      tRef.current = t;
    },
    [t, tRef],
  );

  return useMemo(
    () => [onExponentialBackoff, reset],
    [onExponentialBackoff, reset],
  );
};
