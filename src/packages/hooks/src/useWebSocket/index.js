import isNil from '@misakey/core/helpers/isNil';
import isJSON from '@misakey/core/helpers/isJSON';
import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';
import noop from '@misakey/core/helpers/noop';

import { useSelector } from 'react-redux';
import { useMemo, useEffect, useRef, useCallback } from 'react';
import useExponentialBackoff from '@misakey/hooks/useWebSocket/exponentialBackoff';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

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
export const isSocketOpen = ({ readyState }) => isNil(readyState) || readyState === 1;

// HOOKS
/**
 * @param {string} endpoint endpoint on which to instantiate websocket, see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket
 * @param {Function} [onMessage=defaultOnMessage] callback when message received
 * @param {Boolean} [isReady=true] extra boolean to condition websocket instantiation
 * @returns {Object} socketRef - React useRef format
 * Warning, make sure socket is open before trying to send data
 */
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

  const canInit = useMemo(
    () => isReady && isAuthenticated,
    [isAuthenticated, isReady],
  );

  useEffect(
    () => {
      if (canInit) {
        onInit();
        return clearSocket;
      }
      return noop;
    },
    [onInit, clearSocket, canInit],
  );

  return socket;
};
