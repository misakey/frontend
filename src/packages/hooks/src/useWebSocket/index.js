import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import getNextSearch from '@misakey/helpers/getNextSearch';
import isNil from '@misakey/helpers/isNil';
import isJSON from '@misakey/helpers/isJSON';
import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

// CONSTANTS
const { token: TOKEN_SELECTOR } = authSelectors;

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
export default (endpoint, onMessage = defaultOnMessage) => {
  const socket = useRef();

  const token = useSelector(TOKEN_SELECTOR);

  const endpointWithToken = useMemo(
    () => {
      const { hostname, pathname, hash, search, protocol } = parseUrlFromLocation(endpoint);
      const nextSearch = getNextSearch(search, new Map([['access_token', token]]));
      return `${protocol}${hostname}${pathname}${hash}?${nextSearch}`;
    },
    [endpoint, token],
  );

  const clearSocket = useCallback(
    () => {
      const { current } = socket;
      if (!isNil(current)) {
        if (isSocketOpen(current)) {
          current.close();
        } else {
          current.onopen = () => { current.close(); };
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
      socket.current = new WebSocket(endpointWithToken);

      socket.current.onerror = (e) => {
        console.error('websocket error:', e); // eslint-disable-line no-console
      };

      socket.current.onmessage = handleMessage;
    },
    [socket, endpointWithToken, handleMessage],
  );

  useEffect(
    () => {
      onInit();
      return clearSocket;
    },
    [onInit, clearSocket],
  );
};
