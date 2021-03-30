
import { useState, useMemo, useCallback } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import routes from 'routes';
import { normalize } from 'normalizr';

import BoxesEventsSchema from 'store/schemas/Boxes/Events';
import { actionCreators, selectors } from 'store/reducers/userBoxes/pagination/events';
import { receiveBoxEvents } from 'store/reducers/box';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import path from '@misakey/helpers/path';
import pickAll from '@misakey/helpers/pickAll';
import getMissingIndexes from '@misakey/helpers/getMissingIndexes';
import { getBoxEventsBuilder, countBoxEventsBuilder } from '@misakey/helpers/builder/boxes';
import { makeOffsetLimitFromRange, makeRangeFromOffsetLimit } from '@misakey/helpers/offsetLimitRange';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

// CONSTANTS
const {
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

const { receivePaginatedItemCount, receivePaginatedIds, addPaginatedId } = actionCreators;
const { makeGetByPagination, makeGetItemCount } = selectors;

// HELPERS
const boxIdParamPath = path(['params', 'id']);

// HOOKS
export default (shouldStart = true) => {
  const [isFetching, setIsFetching] = useState(false);

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const boxId = useMemo(
    () => boxIdParamPath(matchBoxSelected),
    [matchBoxSelected],
  );

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

  // SELECTORS hooks
  const byPagination = useSelector((state) => getByPaginationSelector(state, boxId));
  const itemCount = useSelector((state) => getItemCountSelector(state, boxId));

  const dispatchReceiveEvents = useCallback(
    (data, { offset, limit }) => {
      const normalized = normalize(
        data,
        BoxesEventsSchema.collection,
      );
      const { result } = normalized;
      return Promise.resolve(
        dispatch(receiveBoxEvents(boxId, data)),
      ).then(
        () => Promise.resolve(dispatch(receivePaginatedIds(boxId, offset, limit, result))),
      );
    },
    [boxId, dispatch],
  );

  const dispatchAddEvents = useCallback(
    (data) => Promise.all([...data.map(({ id }) => dispatch(addPaginatedId(boxId, id)))]),
    [dispatch, boxId],
  );

  // API data fetching:
  // get boxes
  // check missing applications in store
  // get applications
  const get = useCallback(
    (pagination) => {
      setIsFetching(true);
      return getBoxEventsBuilder(boxId, pagination)
        .then((response) => dispatchReceiveEvents(response.map(objectToCamelCase), pagination))
        .finally(() => setIsFetching(false));
    },
    [dispatchReceiveEvents, boxId, setIsFetching],
  );

  const getCount = useCallback(
    () => countBoxEventsBuilder(boxId),
    [boxId],
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

  const addItems = useCallback(
    (items) => {
      setIsFetching(true);
      return dispatchAddEvents(items)
        .finally(() => setIsFetching(false));
    },
    [dispatchAddEvents],
  );

  // @UNUSED
  const refresh = useCallback(
    () => {
      const toRefreshIndexes = Object.keys(byPagination).map(((index) => parseInt(index, 10)));
      const pagination = makeOffsetLimitFromRange(toRefreshIndexes);
      setIsFetching(true);
      return getCount()
        .then((result) => {
          const countDiff = result - itemCount;
          if (countDiff > 0) {
            pagination.limit += countDiff;
          }
          return get(pagination).then(
            () => Promise.resolve(dispatch(receivePaginatedItemCount(boxId, result))),
          );
        });
    },
    [boxId, byPagination, dispatch, get, getCount, itemCount],
  );

  const shouldFetch = useMemo(
    () => isNil(itemCount) && !isNil(boxId) && isAuthenticated && shouldStart,
    [boxId, isAuthenticated, itemCount, shouldStart],
  );

  const onSuccess = useCallback(
    (result) => dispatch(receivePaginatedItemCount(boxId, result)),
    [boxId, dispatch],
  );

  const { isFetching: isFetchingCount } = useFetchEffect(getCount, { shouldFetch }, { onSuccess });

  // extra memoization layer because of object format
  return useMemo(
    () => ({
      byPagination,
      itemCount,
      isFetching: isFetchingCount || isFetching,
      loadMoreItems,
      addItems,
      refresh,
    }),
    [byPagination, itemCount, isFetchingCount, isFetching, loadMoreItems, addItems, refresh],
  );
};
