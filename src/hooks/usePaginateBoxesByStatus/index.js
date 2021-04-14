import { actionCreators, selectors } from 'store/reducers/userBoxes/pagination';
import { receiveJoinedBoxesByDatatag } from 'store/reducers/box';

import pickAll from '@misakey/core/helpers/pickAll';
import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import { makeOffsetLimitFromRange, makeRangeFromOffsetLimit } from '@misakey/core/helpers/offsetLimitRange';
import { getUserBoxesBuilder, countUserBoxesBuilder } from '@misakey/core/api/helpers/builder/boxes';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import debounce from '@misakey/core/helpers/debounce';
import getMissingIndexes from '@misakey/core/helpers/getMissingIndexes';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useMemo, useCallback } from 'react';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useDispatch, useSelector } from 'react-redux';

// CONSTANTS
const { receivePaginatedItemCount, receivePaginatedIds } = actionCreators;
const {
  makeGetBySearchPagination, makeGetByPagination, makeGetItemCount, makeGetSearch,
} = selectors;

// HOOKS
/**
 * @param {String} filterId id to group by
 * @param {Object} [queryParams={}] to add to payload
 * @param {String} [search=null] search
 * @param {Function} [onError=null] on error specific handler
 * @returns {{byPagination: Object, itemCount: Number, loadMoreItems: Function}}
 * where:
 * - byPagination is a map of paginated elements
 * - itemCount is the total number of elements
 * - loadMoreItems is a function to call to ask for more items
 */
export default (filterId, queryParams = {}, search = null, onError = null) => {
  const handleHttpErrors = useHandleHttpErrors();

  const hasSearch = useMemo(() => !isNil(search), [search]);

  // payload for API
  const payload = useMemo(
    () => ({
      ...(hasSearch ? { search } : {}),
      ...queryParams,
    }),
    [hasSearch, search, queryParams],
  );

  const dispatch = useDispatch();

  // SELECTORS
  const byPaginationSelector = useMemo(
    () => (hasSearch ? makeGetBySearchPagination() : makeGetByPagination()),
    [hasSearch],
  );

  const getItemCountSelector = useMemo(
    () => makeGetItemCount(),
    [],
  );

  const getSearchSelector = useMemo(
    () => makeGetSearch(),
    [],
  );
  // ---

  // SELECTORS hooks with memoization layer
  const byPagination = useSelector((state) => byPaginationSelector(state, filterId));
  const itemCount = useSelector((state) => getItemCountSelector(state, filterId));
  const currentSearch = useSelector((state) => getSearchSelector(state, filterId));

  // ---

  const dispatchReceiveBoxes = useCallback(
    (data, { offset, limit }, metadata) => Promise.resolve(
      dispatch(receiveJoinedBoxesByDatatag(data, metadata)),
    )
      .then(({ result }) => dispatch(receivePaginatedIds(filterId, offset, limit, result, search))),
    [dispatch, filterId, search],
  );

  // API data fetching:
  // get boxes
  // check missing applications in store
  // get applications
  const get = useCallback(
    (pagination) => getUserBoxesBuilder({ ...payload, ...pagination })
      .then((response) => dispatchReceiveBoxes(
        response.map(objectToCamelCase),
        pagination,
        payload,
      ))
      .catch((e) => {
        if (isFunction(onError)) {
          onError(e);
        } else {
          handleHttpErrors(e);
        }
      }),
    [dispatchReceiveBoxes, handleHttpErrors, onError, payload],
  );

  const getCount = useCallback(
    () => countUserBoxesBuilder(payload),
    [payload],
  );

  const onGetSearch = useMemo(
    () => debounce(async (pagination) => get(pagination), 200, { leading: true }),
    [get],
  );

  // called by react-window lists
  // decides whenever API calls are needed
  const loadMoreItems = useCallback(
    (pagination) => {
      const askedPagination = makeRangeFromOffsetLimit(pagination);
      const pickedIndexes = pickAll(askedPagination, byPagination);
      const paginatedIds = Object.values(pickedIndexes)
        .filter((pickedIndex) => !isNil(pickedIndex));
      // if search has changed, we want to replace all data in bySearchPagination
      if ((currentSearch !== search) && (!isNil(currentSearch) || !isNil(search))) {
        return onGetSearch(pagination);
      }
      // when asked data is already in store
      if (askedPagination.length === paginatedIds.length) {
        return Promise.resolve();
      }
      const missingIndexes = getMissingIndexes(pickedIndexes).map(((index) => parseInt(index, 10)));
      // call API
      return get(makeOffsetLimitFromRange(missingIndexes));
    },
    [byPagination, currentSearch, get, search, onGetSearch],
  );

  // update itemCount whenever it is nil
  const shouldFetch = useMemo(
    () => isNil(itemCount),
    [itemCount],
  );

  const onSuccess = useCallback(
    (result) => dispatch(receivePaginatedItemCount(filterId, result)),
    [dispatch, filterId],
  );

  const handleError = useCallback(
    (e) => {
      if (isFunction(onError)) {
        onError(e);
      } else {
        handleHttpErrors(e);
      }
    },
    [handleHttpErrors, onError],
  );

  useFetchEffect(
    getCount,
    { shouldFetch, deps: [filterId, payload] },
    { onSuccess, onError: handleError },
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
