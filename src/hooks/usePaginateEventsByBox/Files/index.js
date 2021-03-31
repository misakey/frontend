
import { useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import { normalize } from 'normalizr';

import { actionCreators, selectors } from 'store/reducers/userBoxes/pagination/events/files';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

import pickAll from '@misakey/helpers/pickAll';
import isNil from '@misakey/helpers/isNil';
import { makeOffsetLimitFromRange, makeRangeFromOffsetLimit } from '@misakey/helpers/offsetLimitRange';
import { getBoxFilesEventsBuilder, countBoxFilesEventsBuilder } from '@misakey/api/helpers/builder/boxes';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import getMissingIndexes from '@misakey/helpers/getMissingIndexes';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { getEventForNormalization } from 'helpers/boxEvent';

// CONSTANTS
const { receivePaginatedItemCount, receivePaginatedIds } = actionCreators;
const { makeGetByPagination, makeGetItemCount } = selectors;

// HOOKS
/**
 * @param {String} [boxId]
 * @param {Boolean} [shouldFetchCount=true]
 * @returns {{byPagination: Object, itemCount: Number, loadMoreItems: Function}}
 * where:
 * - byPagination is a map of paginated elements
 * - itemCount is the total number of elements
 * - loadMoreItems is a function to call to ask for more items
 */
export default (boxId) => {
  const handleHttpErrors = useHandleHttpErrors();

  const dispatch = useDispatch();

  // SELECTORS
  const getByPaginationSelector = useMemo(
    () => makeGetByPagination(),
    [],
  );

  const getItemCountSelector = useMemo(
    () => makeGetItemCount(),
    [],
  );

  // SELECTORS hooks with memoization layer
  const byPagination = useSelector((state) => getByPaginationSelector(state, boxId));
  const itemCount = useSelector((state) => getItemCountSelector(state, boxId));
  // ---

  const dispatchReceived = useCallback(
    (data, { offset, limit }) => {
      const normalized = normalize(
        data.map(getEventForNormalization),
        BoxEventsSchema.collection,
      );
      const { entities, result } = normalized;

      batch(() => {
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
        dispatch(receivePaginatedIds(boxId, offset, limit, result));
      });
    },
    [boxId, dispatch],
  );

  // API data fetching:
  // get files events
  const get = useCallback(
    (pagination) => getBoxFilesEventsBuilder(boxId, pagination)
      .then((response) => dispatchReceived(response.map(objectToCamelCase), pagination)),
    [boxId, dispatchReceived],
  );

  // called by react-window lists
  // decides whenever API calls are needed
  const loadMoreItems = useCallback(
    (pagination) => {
      const askedPagination = makeRangeFromOffsetLimit(pagination);
      const pickedIndexes = pickAll(askedPagination, byPagination);
      const paginatedIds = Object.values(pickedIndexes)
        .filter((pickedIndex) => !isNil(pickedIndex));
      // when asked data is already in store
      if (askedPagination.length === paginatedIds.length) {
        return Promise.resolve();
      }
      const missingIndexes = getMissingIndexes(pickedIndexes).map(((index) => parseInt(index, 10)));
      // call API
      return get(makeOffsetLimitFromRange(missingIndexes));
    },
    [byPagination, get],
  );

  // update itemCount whenever it is nil
  useEffect(
    () => {
      if (isNil(itemCount)) {
        countBoxFilesEventsBuilder(boxId)
          .then((result) => dispatch(receivePaginatedItemCount(boxId, result)))
          .catch((e) => handleHttpErrors(e));
      }
    },
    [boxId, dispatch, handleHttpErrors, itemCount],
  );

  // extra memoization layer because of object format
  return useMemo(
    () => ({
      byPagination,
      itemCount,
      loadMoreItems,
    }),
    [byPagination, itemCount, loadMoreItems],
  );
};
