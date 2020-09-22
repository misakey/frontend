import { createSelector } from 'reselect';
import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';

import range from '@misakey/helpers/range';
import pick from '@misakey/helpers/pick';
import prop from '@misakey/helpers/prop';
import invertObj from '@misakey/helpers/invertObj';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

// CONSTANTS
export const BY_PAGINATION = 'byPagination';
export const BY_SEARCH_PAGINATION = 'bySearchPagination';
export const INITIAL_STATE = {
  [BY_PAGINATION]: {},
  [BY_SEARCH_PAGINATION]: {},
  itemCount: null,
  search: null,
};

// HELPERS
const getIdPaginatedIndex = (pagination, id) => invertObj(pagination)[id];

// ACTION HANDLERS
// @FIXME what should happen to byPagination if itemCount changes with already paginated items ?
const onReceivePaginatedItemCount = (state, { itemCount }) => ({
  ...state,
  itemCount,
});

const onReceivePaginatedIds = (state, { offset, limit, ids, search = null }) => {
  const paginatedRange = range(offset, offset + limit);
  const stateKey = !isNil(search) ? BY_SEARCH_PAGINATION : BY_PAGINATION;

  const nextByPagination = paginatedRange.reduce((aggr, key, index) => ({
    ...aggr,
    [key]: ids[index],
  }), {});

  return {
    ...state,
    search,
    [stateKey]: {
      ...state[stateKey],
      ...nextByPagination,
    },
  };
};

const onAddPaginatedId = (state, { id, search = null }) => {
  const stateKey = !isNil(search) ? BY_SEARCH_PAGINATION : BY_PAGINATION;
  // Box is already in list
  const currentBoxIds = Object.values(state[stateKey]);
  if (currentBoxIds.includes(id)) {
    return state;
  }
  // Add new box
  const nextByPagination = Object.entries(state[stateKey])
    .reduce((aggr, [key, value]) => ({
      ...aggr,
      [parseInt(key, 10) + 1]: value,
    }), { 0: id });

  const nextItemCount = (state.itemCount || 0) + 1;

  return {
    ...state,
    search,
    [stateKey]: nextByPagination,
    itemCount: nextItemCount,
  };
};

const onRemovePaginatedId = (state, { id, search = null }) => {
  const stateKey = !isNil(search) ? BY_SEARCH_PAGINATION : BY_PAGINATION;
  const paginatedIndex = getIdPaginatedIndex(state[stateKey], id);

  if (isNil(paginatedIndex)) {
    return state;
  }

  const unchangedRanged = range(0, paginatedIndex);
  const unchangedByPagination = pick(unchangedRanged, state[stateKey]);

  const nextByPagination = Object.entries(state[stateKey])
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
    search,
    [stateKey]: nextByPagination,
    itemCount: state.itemCount - 1,
  };
};

// FACTORY
/**
 *
 * @param {String} prefix prefix to make a unique reducer
 * @param {Function} [getState] optional method to help fetch state via selectors
 */
export const makePaginationReducer = (prefix, getState, initialState = INITIAL_STATE) => {
  const uppercasedPrefix = prefix.toUpperCase();

  // ACTIONS
  const RECEIVE_PAGINATED_ITEM_COUNT = Symbol(`${uppercasedPrefix}_RECEIVE_PAGINATED_ITEM_COUNT`);
  const RECEIVE_PAGINATED_IDS = Symbol(`${uppercasedPrefix}_RECEIVE_PAGINATED_IDS`);
  const ADD_PAGINATED_ID = Symbol(`${uppercasedPrefix}_ADD_PAGINATED_ID`);
  const REMOVE_PAGINATED_ID = Symbol(`${uppercasedPrefix}_REMOVE_PAGINATED_ID`);
  const RESET_PAGINATION = Symbol(`${uppercasedPrefix}_RESET_PAGINATION`);

  // ACTION CREATORS
  const receivePaginatedItemCount = (itemCount) => ({
    type: RECEIVE_PAGINATED_ITEM_COUNT,
    itemCount,
  });

  const receivePaginatedIds = (offset, limit, ids, search = null) => ({
    type: RECEIVE_PAGINATED_IDS,
    offset,
    limit,
    ids,
    search,
  });

  const addPaginatedId = (id, search = null) => ({
    type: ADD_PAGINATED_ID,
    id,
    search,
  });

  const removePaginatedId = (id, search = null) => ({
    type: REMOVE_PAGINATED_ID,
    id,
    search,
  });

  const resetPagination = () => ({
    type: RESET_PAGINATION,
  });

  // SELECTORS
  const selectors = isFunction(getState) ? {
    getByPagination: createSelector(
      getState,
      prop(BY_PAGINATION),
    ),
    getSearch: createSelector(
      getState,
      prop('search'),
    ),
    getBySearchPagination: createSelector(
      getState,
      prop(BY_SEARCH_PAGINATION),
    ),
    getItemCount: createSelector(
      getState,
      prop('itemCount'),
    ),
  } : {};

  // REDUCER
  const reducer = createResetOnSignOutReducer(initialState, {
    [RECEIVE_PAGINATED_ITEM_COUNT]: onReceivePaginatedItemCount,
    [RECEIVE_PAGINATED_IDS]: onReceivePaginatedIds,
    [ADD_PAGINATED_ID]: onAddPaginatedId,
    [REMOVE_PAGINATED_ID]: onRemovePaginatedId,
    [RESET_PAGINATION]: () => initialState,
  });

  return {
    actions: {
      RECEIVE_PAGINATED_ITEM_COUNT,
      RECEIVE_PAGINATED_IDS,
      ADD_PAGINATED_ID,
      REMOVE_PAGINATED_ID,
      RESET_PAGINATION,
    },
    actionCreators: {
      receivePaginatedItemCount,
      receivePaginatedIds,
      addPaginatedId,
      removePaginatedId,
      resetPagination,
    },
    selectors,
    reducer,
  };
};
