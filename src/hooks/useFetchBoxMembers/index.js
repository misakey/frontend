import BoxesSchema from 'store/schemas/Boxes';
import SenderSchema from 'store/schemas/Boxes/Sender';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import { normalize } from 'normalizr';

import { getBoxMembersBuilder } from '@misakey/helpers/builder/boxes';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

export default () => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const dispatchReceiveBoxMembers = useCallback(
    (boxId, members) => {
      const normalized = normalize(
        members,
        SenderSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updateEntities([{ id: boxId, changes: { members: result } }], BoxesSchema)),
      ]);
    },
    [dispatch],
  );

  return useCallback(
    (boxId) => getBoxMembersBuilder(boxId)
      .then((result) => dispatchReceiveBoxMembers(boxId, result))
      .catch(handleHttpErrors),
    [dispatchReceiveBoxMembers, handleHttpErrors],
  );
};
