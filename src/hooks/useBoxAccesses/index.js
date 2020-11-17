import BoxesSchema from 'store/schemas/Boxes';
import EventsSchema from 'store/schemas/Boxes/Events';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import { normalize } from 'normalizr';

import { getBoxAccessesBuilder } from '@misakey/helpers/builder/boxes';
import isNil from '@misakey/helpers/isNil';

import { useCallback, useMemo } from 'react';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useDispatch } from 'react-redux';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useBoxReadContext } from 'components/smart/Context/Boxes/BoxRead';

export default (box) => {
  const dispatch = useDispatch();
  const { id, accesses } = useSafeDestr(box);
  const { isCurrentUserOwner } = useBoxReadContext();

  /* FETCH ACCESSES */
  const onFetchAccesses = useCallback(
    () => getBoxAccessesBuilder(id),
    [id],
  );

  const shouldFetch = useMemo(
    () => isNil(accesses) && isCurrentUserOwner,
    [accesses, isCurrentUserOwner],
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

  const metadata = useFetchEffect(
    onFetchAccesses,
    { shouldFetch },
    { onSuccess },
  );

  return useMemo(
    () => ({
      isCurrentUserOwner,
      ...metadata,
    }),
    [isCurrentUserOwner, metadata],
  );
};
