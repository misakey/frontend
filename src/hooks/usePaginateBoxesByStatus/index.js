import { ALL } from 'constants/app/boxes/statuses';
import { actionCreators, selectors } from 'store/reducers/userBoxes/pagination';
import { receiveJoinedBoxes } from 'store/reducers/box';

import propOr from '@misakey/helpers/propOr';
import pickAll from '@misakey/helpers/pickAll';
import noop from '@misakey/helpers/noop';
import isNil from '@misakey/helpers/isNil';
import __ from '@misakey/helpers/__';
import { makeOffsetLimitFromRange, makeRangeFromOffsetLimit } from '@misakey/helpers/offsetLimitRange';
import { getUserBoxesBuilder, countUserBoxesBuilder } from '@misakey/helpers/builder/boxes';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import debounce from '@misakey/helpers/debounce';
import getMissingIndexes from '@misakey/helpers/getMissingIndexes';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// CONSTANTS
const EMPTY_OBJ = {};

// HELPERS
const actionCreatorsProp = propOr(EMPTY_OBJ, __, actionCreators);
const selectorsProp = propOr(EMPTY_OBJ, __, selectors);

const getReceiveItemCountActionCreator = (status) => {
  const statusActionCreators = actionCreatorsProp(status);
  return statusActionCreators.receivePaginatedItemCount || noop;
};

const getReceiveActionCreator = (status) => {
  const statusActionCreators = actionCreatorsProp(status);
  return statusActionCreators.receivePaginatedIds || noop;
};

// HOOKS
/**
 * @param {String} [status = 'all'] one of possible box statuses
 * @see src/constants/app/boxes/statuses.js
 * @param {String} [search=null]
 * @returns {{byPagination: Object, itemCount: Number, loadMoreItems: Function}}
 * where:
 * - byPagination is a map of paginated elements
 * - itemCount is the total number of elements
 * - loadMoreItems is a function to call to ask for more items
 */
export default (status = ALL, search = null) => {
  const handleHttpErrors = useHandleHttpErrors();

  const hasSearch = useMemo(() => !isNil(search), [search]);

  // payload for API
  const payload = useMemo(
    () => ({
      ...(hasSearch ? { search } : {}),
      ...(status !== ALL ? { statuses: [status] } : {}),
    }),
    [hasSearch, search, status],
  );

  // ACTIONS
  const receiveItemCountAction = useMemo(
    () => getReceiveItemCountActionCreator(status),
    [status],
  );

  const receivePaginationAction = useMemo(
    () => getReceiveActionCreator(status),
    [status],
  );
  // ---

  const dispatch = useDispatch();

  // SELECTORS
  const statusSelectors = useMemo(
    () => selectorsProp(status),
    [status],
  );

  const byPaginationSelector = useMemo(
    () => (hasSearch ? statusSelectors.getBySearchPagination : statusSelectors.getByPagination),
    [hasSearch, statusSelectors.getByPagination, statusSelectors.getBySearchPagination],
  );

  const itemCountSelector = useMemo(
    () => statusSelectors.getItemCount,
    [statusSelectors.getItemCount],
  );

  const searchSelector = useMemo(
    () => statusSelectors.getSearch,
    [statusSelectors.getSearch],
  );

  // ---

  // SELECTORS hooks with memoization layer
  const byPagination = useSelector(byPaginationSelector);
  const itemCount = useSelector(itemCountSelector);
  const currentSearch = useSelector(searchSelector);

  // ---

  const dispatchReceiveBoxes = useCallback(
    (data, { offset, limit }) => Promise.resolve(dispatch(receiveJoinedBoxes(data)))
      .then(({ result }) => dispatch(receivePaginationAction(offset, limit, result, search))),
    [dispatch, search, receivePaginationAction],
  );

  // API data fetching:
  // get boxes
  // check missing applications in store
  // get applications
  const get = useCallback(
    (pagination) => getUserBoxesBuilder({ ...payload, ...pagination })
      .then((response) => dispatchReceiveBoxes(response.map(objectToCamelCase), pagination)),
    [dispatchReceiveBoxes, payload],
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
  useEffect(
    () => {
      if (isNil(itemCount)) {
        getCount()
          .then((result) => dispatch(receiveItemCountAction(result)))
          .catch((e) => handleHttpErrors(e));
      }
    },
    [dispatch, getCount, handleHttpErrors, itemCount, receiveItemCountAction],
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
