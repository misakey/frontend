import BoxesSchema from 'store/schemas/Boxes';
import UserSchema from '@misakey/react/auth/store/schemas/User';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import { normalize } from 'normalizr';

import { getBoxMembersBuilder } from '@misakey/core/api/helpers/builder/boxes';

import { useCallback } from 'react';
import useUpdatedRef from '@misakey/hooks/useUpdatedRef';
import { batch, useDispatch } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchCallback from '@misakey/hooks/useFetch/callback';

// HOOKS
export default (boxId) => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const boxIdRef = useUpdatedRef(boxId);

  const dispatchReceiveBoxMembers = useCallback(
    (response) => {
      const normalized = normalize(
        response,
        UserSchema.collection,
      );
      const { entities, result } = normalized;
      return batch(
        () => Promise.all([
          dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
          dispatch(updateEntities([{
            id: boxIdRef.current, changes: { members: result },
          }], BoxesSchema)),
        ]),
      );
    },
    [boxIdRef, dispatch],
  );

  const onSuccess = useCallback(
    (result) => dispatchReceiveBoxMembers(result),
    [dispatchReceiveBoxMembers],
  );

  const get = useCallback(
    () => getBoxMembersBuilder(boxIdRef.current),
    [boxIdRef],
  );

  return useFetchCallback(get, { onSuccess, onError: handleHttpErrors });
};
