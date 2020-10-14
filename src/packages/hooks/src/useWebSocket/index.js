import { useSelector } from 'react-redux';
import isNil from '@misakey/helpers/isNil';
import isJSON from '@misakey/helpers/isJSON';
import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import noop from '@misakey/helpers/noop';

import { useEffect, useRef, useCallback } from 'react';
import useExponentialBackoff from '@misakey/hooks/useWebSocket/exponentialBackoff';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

// CONSTANTS
export const NORMAL_CLOSE_CODE = 1000;
export const ABNORMAL_CLOSE_CODE = 1006;
const { isAuthenticated: isAuthenticatedSelector } = authSelectors;

// HELPERS
const defaultOnMessage = (e) => {
  const { data } = e;
  if (isJSON(data)) {
    console.log(objectToCamelCaseDeep(JSON.parse(data))); // eslint-disable-line no-console
  } else {
    console.log(data); // eslint-disable-line no-console
  }
};

// see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
const isSocketOpen = ({ readyState }) => isNil(readyState) || readyState === 1;

// HOOKS
export default (endpoint, onMessage = defaultOnMessage, isReady = true) => {
  const socket = useRef();
  const isAuthenticated = useSelector(isAuthenticatedSelector);
  const [exponentialBackoff, resetExponentialBackoff] = useExponentialBackoff();

  const clearSocket = useCallback(
    () => {
      const { current } = socket;
      if (!isNil(current)) {
        if (isSocketOpen(current)) {
          current.close(NORMAL_CLOSE_CODE);
        } else {
          current.onopen = () => { current.close(NORMAL_CLOSE_CODE); };
        }
      }
    },
    [socket],
  );

  const handleMessage = useCallback(
    ({ data }) => {
      if (isJSON(data)) {
        return onMessage(objectToCamelCaseDeep(JSON.parse(data)), clearSocket);
      }
      throw new Error('not JSON', data);
    },
    [onMessage, clearSocket],
  );

  const onInit = useCallback(
    () => {
      socket.current = new WebSocket(endpoint);

      socket.current.onerror = (e) => {
        console.error('websocket error:', e); // eslint-disable-line no-console
      };

      socket.current.onclose = (e) => {
        if (e.code === ABNORMAL_CLOSE_CODE) {
          exponentialBackoff(onInit);
        }
      };

      socket.current.onopen = () => {
        resetExponentialBackoff();
      };

      socket.current.onmessage = handleMessage;
    },
    [endpoint, handleMessage, exponentialBackoff, resetExponentialBackoff],
  );

  useEffect(
    () => {
      if (isReady && isAuthenticated) {
        onInit();
        return clearSocket;
      }
      return noop;
    },
    [onInit, clearSocket, isReady, isAuthenticated],
  );

  return socket;
};
