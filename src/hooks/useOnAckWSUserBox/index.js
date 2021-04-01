import isNil from '@misakey/core/helpers/isNil';
import objectToSnakeCaseDeep from '@misakey/core/helpers/objectToSnakeCaseDeep';

import { useCallback } from 'react';
import { isSocketOpen } from '@misakey/hooks/useWebSocket';

// HOOKS
export default (socketRef, senderId) => useCallback(
  (boxId) => {
    const { current } = socketRef;
    if (!isNil(current)) {
      // do nothing if websocket is not open yet
      if (isSocketOpen(current)) {
        current.send(JSON.stringify(objectToSnakeCaseDeep({
          type: 'ack',
          object: {
            boxId,
            senderId,
          },
        })));
      }
    }
  },
  [senderId, socketRef],
);
