import BoxesEventsSchema from 'store/schemas/Boxes/Events';

import { makePaginationReducer, INITIAL_STATE } from 'store/reducers/helpers/pagination';
import { addBoxEvents, receiveBoxEvents } from 'store/reducers/box';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import pickAll from '@misakey/helpers/pickAll';
import getMissingIndexes from '@misakey/helpers/getMissingIndexes';
import { getBoxEventsBuilder, countBoxEventsBuilder } from '@misakey/helpers/builder/boxes';
import { makeOffsetLimitFromRange, makeRangeFromOffsetLimit } from '@misakey/helpers/offsetLimitRange';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import identity from '@misakey/helpers/identity';
import { normalize } from 'normalizr';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import useReducer from '@misakey/hooks/useReducer';

// CONSTANTS
const {
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

// HELPERS
const getState = identity;

// HOOKS
export default (boxId) => {
  const handleHttpErrors = useHandleHttpErrors();

  const [isFetching, setIsFetching] = useState(false);

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const initialState = useMemo(
    () => ({ ...INITIAL_STATE, boxId }),
    [boxId],
  );

  const {
    actionCreators:
      { receivePaginatedItemCount, receivePaginatedIds, addPaginatedId, resetPagination },
    selectors: { getByPagination, getItemCount },
    reducer,
  } = useMemo(
    () => makePaginationReducer(boxId, getState, initialState),
    [boxId, initialState],
  );

  const [state, dispatch] = useReducer(reducer, initialState);

  const reduxDispatch = useDispatch();


  // SELECTORS hooks
  const { boxId: stateBoxId } = useSafeDestr(state);

  const byPagination = useMemo(
    () => (stateBoxId === boxId ? getByPagination(state) : {}),
    [stateBoxId, boxId, getByPagination, state],
  );

  const itemCount = useMemo(
    () => (stateBoxId === boxId ? getItemCount(state) : 0),
    [stateBoxId, boxId, getItemCount, state],
  );

  const dispatchReceiveEvents = useCallback(
    (data, { offset, limit }) => {
      const normalized = normalize(
        data,
        BoxesEventsSchema.collection,
      );
      const { result } = normalized;
      return Promise.resolve(
        reduxDispatch(receiveBoxEvents(boxId, data)),
      ).then(
        () => Promise.resolve(dispatch(receivePaginatedIds(offset, limit, result))),
      );
    },
    [reduxDispatch, boxId, dispatch, receivePaginatedIds],
  );

  const dispatchAddEvents = useCallback(
    (data) => {
      const normalized = normalize(
        data,
        BoxesEventsSchema.collection,
      );
      const { result } = normalized;
      return Promise.resolve(
        reduxDispatch(addBoxEvents(boxId, data)),
      ).then(
        () => Promise.all([...result.map((id) => dispatch(addPaginatedId(id)))]),
      );
    },
    [reduxDispatch, boxId, dispatch, addPaginatedId],
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
      return Promise.resolve(
        dispatchAddEvents(items),
      )
        .finally(() => setIsFetching(false));
    },
    [dispatchAddEvents],
  );

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
            () => Promise.resolve(dispatch(receivePaginatedItemCount(result))),
          );
        });
    },
    [byPagination, dispatch, get, getCount, itemCount, receivePaginatedItemCount],
  );

  // update itemCount whenever it is nil
  useEffect(
    () => {
      if (isNil(itemCount) && isAuthenticated) {
        getCount()
          .then((result) => dispatch(receivePaginatedItemCount(result)))
          .catch((e) => handleHttpErrors(e))
          .finally(() => setIsFetching(false));
      }
    },
    [
      dispatch, receivePaginatedItemCount, setIsFetching, handleHttpErrors,
      getCount, isAuthenticated, itemCount,
    ],
  );

  useLayoutEffect(() => {
    setIsFetching(true);
    Promise.resolve(dispatch(resetPagination()))
      .then(() => { setIsFetching(false); });
  },
  [boxId, resetPagination, dispatch, setIsFetching]);

  // extra memoization layer because of object format
  return useMemo(
    () => ({
      byPagination,
      itemCount,
      isFetching,
      loadMoreItems,
      addItems,
      refresh,
    }),
    [byPagination, itemCount, isFetching, loadMoreItems, addItems, refresh],
  );
};
