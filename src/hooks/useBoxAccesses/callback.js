import BoxesSchema from 'store/schemas/Boxes';
import EventsSchema from 'store/schemas/Boxes/Events';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import { normalize } from 'normalizr';

import { getBoxAccessesBuilder } from '@misakey/api/helpers/builder/boxes';

import { useCallback } from 'react';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useDispatch } from 'react-redux';
import useFetchCallback from '@misakey/hooks/useFetch/callback';

export default (box) => {
  const dispatch = useDispatch();
  const { id } = useSafeDestr(box);

  /* FETCH ACCESSES */
  const onFetchAccesses = useCallback(
    () => getBoxAccessesBuilder(id),
    [id],
  );

  const onSuccess = useCallback(
    (response) => {
      const normalized = normalize(
        response,
        EventsSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updateEntities([{ id, changes: { accesses: result } }], BoxesSchema)),
      ]);
    },
    [dispatch, id],
  );

  return useFetchCallback(
    onFetchAccesses,
    { onSuccess },
  );
};
