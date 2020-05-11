import { createSelector } from 'reselect';
import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';

import range from '@misakey/helpers/range';
import pick from '@misakey/helpers/pick';
import prop from '@misakey/helpers/prop';
import invertObj from '@misakey/helpers/invertObj';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

// CONSTANTS
export const INITIAL_STATE = { byPagination: {}, itemCount: null };

// HELPERS
const getIdPaginatedIndex = (pagination, id) => invertObj(pagination)[id];

// ACTION HANDLERS
// @FIXME what should happen to byPagination if itemCount changes with already paginated items ?
const onReceivePaginatedItemCount = (state, { itemCount }) => ({
  ...state,
  itemCount,
});

const onReceivePaginatedIds = (state, { offset, limit, ids }) => {
  const paginatedRange = range(offset, offset + limit);

  const nextByPagination = paginatedRange.reduce((aggr, key, index) => ({
    ...aggr,
    [key]: ids[index],
  }), {});

  return {
    ...state,
    byPagination: {
      ...state.byPagination,
      ...nextByPagination,
    },
  };
};

const onAddPaginatedId = (state, { id }) => {
  const nextByPagination = Object.entries(state.byPagination)
    .reduce((aggr, [key, value]) => ({
      ...aggr,
      [parseInt(key, 10) + 1]: value,
    }), { 0: id });

  return {
    ...state,
    byPagination: nextByPagination,
    itemCount: (state.itemCount || 0) + 1,
  };
};

const onRemovePaginatedId = (state, { id }) => {
  const paginatedIndex = getIdPaginatedIndex(state.byPagination, id);

  if (isNil(paginatedIndex)) {
    return state;
  }

  const unchangedRanged = range(0, paginatedIndex);
  const unchangedByPagination = pick(unchangedRanged, state.byPagination);

  const nextByPagination = Object.entries(state.byPagination)
    .reduce((aggr, [key, value]) => {
      const intKey = parseInt(key, 10);
      if (intKey > paginatedIndex) {
        return {
          ...aggr,
          [intKey - 1]: value,
        };
      }
      // unchanged
      return aggr;
    }, unchangedByPagination);

  return {
    ...state,
    byPagination: nextByPagination,
    itemCount: state.itemCount - 1,
  };
};

// FACTORY
/**
 *
 * @param {String} prefix prefix to make a unique reducer
 * @param {Function} [getState] optional method to help fetch state via selectors
 */
export const makePaginationReducer = (prefix, getState) => {
  const uppercasedPrefix = prefix.toUpperCase();

  // ACTIONS
  const RECEIVE_PAGINATED_ITEM_COUNT = Symbol(`${uppercasedPrefix}_RECEIVE_PAGINATED_ITEM_COUNT`);
  const RECEIVE_PAGINATED_IDS = Symbol(`${uppercasedPrefix}_RECEIVE_PAGINATED_IDS`);
  const ADD_PAGINATED_ID = Symbol(`${uppercasedPrefix}_ADD_PAGINATED_ID`);
  const REMOVE_PAGINATED_ID = Symbol(`${uppercasedPrefix}_REMOVE_PAGINATED_ID`);

  // ACTION CREATORS
  const receivePaginatedItemCount = (itemCount) => ({
    type: RECEIVE_PAGINATED_ITEM_COUNT,
    itemCount,
  });

  const receivePaginatedIds = (offset, limit, ids) => ({
    type: RECEIVE_PAGINATED_IDS,
    offset,
    limit,
    ids,
  });

  const addPaginatedId = (id) => ({
    type: ADD_PAGINATED_ID,
    id,
  });

  const removePaginatedId = (id) => ({
    type: REMOVE_PAGINATED_ID,
    id,
  });

  // SELECTORS
  const selectors = isFunction(getState) ? {
    getByPagination: createSelector(
      getState,
      prop('byPagination'),
    ),
    getItemCount: createSelector(
      getState,
      prop('itemCount'),
    ),
  } : {};

  // REDUCER
  const reducer = createResetOnSignOutReducer(INITIAL_STATE, {
    [RECEIVE_PAGINATED_ITEM_COUNT]: onReceivePaginatedItemCount,
    [RECEIVE_PAGINATED_IDS]: onReceivePaginatedIds,
    [ADD_PAGINATED_ID]: onAddPaginatedId,
    [REMOVE_PAGINATED_ID]: onRemovePaginatedId,
  });

  return {
    actions: {
      RECEIVE_PAGINATED_ITEM_COUNT,
      RECEIVE_PAGINATED_IDS,
      ADD_PAGINATED_ID,
      REMOVE_PAGINATED_ID,
    },
    actionCreators: {
      receivePaginatedItemCount,
      receivePaginatedIds,
      addPaginatedId,
      removePaginatedId,
    },
    selectors,
    reducer,
  };
};
