import React, { useMemo, useCallback, useEffect, useRef } from 'react';

import isNil from '@misakey/helpers/isNil';

import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import SnackbarActionRetry from 'components/dumb/Snackbar/Action/Retry';

// CONSTANTS
const INITIAL_DELAY = 4000;
const MAX_RETRY_COUNT = 5;
const DELAY_FACTOR = 2;

// HOOK
export default () => {
  const delay = useRef(INITIAL_DELAY);
  const retryCount = useRef(0);
  const timeoutRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

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

  const exponentialBackoff = useCallback(
    (fn) => {
      if (retryCount.current < MAX_RETRY_COUNT) {
        const text = t('common:error.retry', { delay: delay.current / 1000 });
        enqueueSnackbar(text, { variant: 'warning', action: (key) => <SnackbarActionRetry id={key} fn={fn} onClick={onRetry} /> });
        retryCount.current += 1;
        timeoutRef.current = setTimeout(
          () => {
            fn();
          },
          delay.current,
        );
        delay.current *= DELAY_FACTOR;
      } else {
        const text = t('common:error.stop', { count: MAX_RETRY_COUNT });
        enqueueSnackbar(text, { variant: 'error' });
      }
    },
    [t, enqueueSnackbar, onRetry],
  );

  const reset = useCallback(
    () => {
      delay.current = INITIAL_DELAY;
      retryCount.current = 0;
      killTimeout();
    },
    [delay, retryCount, killTimeout],
  );

  useEffect(
    () => {
      delay.current = INITIAL_DELAY;
      retryCount.current = 0;
      return killTimeout;
    },
    [delay, killTimeout, retryCount],
  );

  return useMemo(
    () => [exponentialBackoff, reset],
    [exponentialBackoff, reset],
  );
};
