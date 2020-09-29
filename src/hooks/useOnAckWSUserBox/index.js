import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities } from '@misakey/store/actions/entities';

import isNil from '@misakey/helpers/isNil';
import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';


export default (socketRef, senderId) => {
  const dispatch = useDispatch();

  const dispatchResetBoxCount = useCallback(
    (id) => Promise.resolve(
      dispatch(updateEntities([{ id, changes: { eventsCount: 0 } }], BoxesSchema)),
    ),
    [dispatch],
  );

  return useCallback(
    (boxId) => {
      const { current } = socketRef;
      if (!isNil(current)) {
        current.send(JSON.stringify(objectToSnakeCaseDeep({
          type: 'ack',
          object: {
            boxId,
            senderId,
          },
        })));
        dispatchResetBoxCount(boxId);
      }
    },
    [dispatchResetBoxCount, senderId, socketRef],
  );
};
