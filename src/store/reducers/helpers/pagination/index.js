import { createSelector } from 'reselect';
import createResetOnSignOutReducer from '@misakey/react/auth/store/reducers/helpers/createResetOnSignOutReducer';

import range from '@misakey/core/helpers/range';
import pick from '@misakey/core/helpers/pick';
import invertObj from '@misakey/core/helpers/invertObj';
import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import pathOr from '@misakey/core/helpers/pathOr';
import path from '@misakey/core/helpers/path';
import propOr from '@misakey/core/helpers/propOr';

// CONSTANTS
export const BY_PAGINATION = 'byPagination';
export const BY_SEARCH_PAGINATION = 'bySearchPagination';
export const INITIAL_STATE = {};
export const INITIAL_SUB_STATE = {
  [BY_PAGINATION]: {},
  [BY_SEARCH_PAGINATION]: {},
  itemCount: null,
  search: null,
};
const EMPTY_OBJECT = {};

// HELPERS
const getIdPaginatedIndex = (pagination, id) => invertObj(pagination)[id];
const getSubstateOrInitial = (filterId, items) => propOr(INITIAL_SUB_STATE, filterId)(items);

const getRemovedPagination = (paginatedIndex, currentByPagination) => {
  const unchangedRange = range(0, paginatedIndex);
  const unchangedByPagination = pick(unchangedRange, currentByPagination);

  const nextByPagination = Object.entries(currentByPagination)
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
  return nextByPagination;
};

// ACTION HANDLERS
// @FIXME what should happen to byPagination if itemCount changes with already paginated items ?
const onReceivePaginatedItemCount = (state, { filterId, itemCount }) => {
  const current = getSubstateOrInitial(filterId, state);
  return {
    ...state,
    [filterId]: {
      ...current,
      itemCount,
    },
  };
};

const onReceivePaginatedIds = (state, { filterId, offset, limit, ids, search = null }) => {
  const paginatedRange = range(offset, offset + limit);
  const stateKey = !isNil(search) ? BY_SEARCH_PAGINATION : BY_PAGINATION;
  const current = getSubstateOrInitial(filterId, state);

  const nextByPagination = paginatedRange.reduce((aggr, key, index) => ({
    ...aggr,
    [key]: ids[index],
  }), {});

  return {
    ...state,
    [filterId]: {
      ...current,
      search,
      [stateKey]: {
        ...current[stateKey],
        ...nextByPagination,
      },
    },
  };
};

const onAddPaginatedId = (state, { filterId, id, search = null }) => {
  const stateKey = !isNil(search) ? BY_SEARCH_PAGINATION : BY_PAGINATION;
  const currentStateById = getSubstateOrInitial(filterId, state);
  const currentByPagination = currentStateById[stateKey];
  // ID is already in list
  const currentIds = Object.values(currentByPagination);
  if (currentIds.includes(id)) {
    return state;
  }
  // Add new box
  const nextByPagination = Object.entries(currentByPagination)
    .reduce((aggr, [key, value]) => ({
      ...aggr,
      [parseInt(key, 10) + 1]: value,
    }), { 0: id });

  const nextItemCount = (currentStateById.itemCount || 0) + 1;

  return {
    ...state,
    [filterId]: {
      ...currentStateById,
      search,
      [stateKey]: nextByPagination,
      itemCount: nextItemCount,
    },
  };
};

const onRemovePaginatedId = (state, { filterId, id, search = null }) => {
  const currentStateById = getSubstateOrInitial(filterId, state);
  const currentByPagination = currentStateById[BY_PAGINATION];
  const currentBySearchPagination = currentStateById[BY_SEARCH_PAGINATION];
  const paginatedIndex = getIdPaginatedIndex(currentByPagination, id);
  const paginatedSearchIndex = getIdPaginatedIndex(currentByPagination, id);
  const currentItemCount = currentStateById.itemCount;

  if (isNil(paginatedIndex) && isNil(paginatedSearchIndex)) {
    // if element is not found but we already have the itemCount
    // decrement it
    if (!isNil(currentItemCount)) {
      return {
        ...state,
        [filterId]: {
          ...currentStateById,
          itemCount: currentItemCount - 1,
        },
      };
    }
    return state;
  }

  if (isNil(paginatedIndex)) {
    const nextBySearchPagination = getRemovedPagination(
      paginatedSearchIndex,
      currentBySearchPagination,
    );

    return {
      ...state,
      [filterId]: {
        ...currentStateById,
        search,
        [BY_SEARCH_PAGINATION]: nextBySearchPagination,
        itemCount: currentItemCount - 1,
      },
    };
  }

  if (isNil(paginatedSearchIndex)) {
    const nextByPagination = getRemovedPagination(paginatedIndex, currentByPagination);

    return {
      ...state,
      [filterId]: {
        ...currentStateById,
        search,
        [BY_PAGINATION]: nextByPagination,
        itemCount: currentItemCount - 1,
      },
    };
  }

  const nextByPagination = getRemovedPagination(paginatedIndex, currentByPagination);
  const nextBySearchPagination = getRemovedPagination(
    paginatedSearchIndex,
    currentBySearchPagination,
  );

  return {
    ...state,
    [filterId]: {
      ...currentStateById,
      search,
      [BY_PAGINATION]: nextByPagination,
      [BY_SEARCH_PAGINATION]: nextBySearchPagination,
      itemCount: currentItemCount - 1,
    },
  };
};

const onResetSearchPagination = (state, { filterId }) => ({
  ...state,
  [filterId]: {
    ...getSubstateOrInitial(filterId, state),
    [BY_SEARCH_PAGINATION]: INITIAL_SUB_STATE[BY_SEARCH_PAGINATION],
  },
});

const onResetPagination = (state, { filterId }) => ({
  ...state,
  [filterId]: INITIAL_SUB_STATE,
});

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
  const RESET_SEARCH_PAGINATION = Symbol(`${uppercasedPrefix}_RESET_SEARCH_PAGINATION`);

  // ACTION CREATORS
  const receivePaginatedItemCount = (filterId, itemCount) => ({
    type: RECEIVE_PAGINATED_ITEM_COUNT,
    itemCount,
    filterId,
  });

  const receivePaginatedIds = (filterId, offset, limit, ids, search = null) => ({
    type: RECEIVE_PAGINATED_IDS,
    offset,
    limit,
    ids,
    search,
    filterId,
  });

  const addPaginatedId = (filterId, id, search = null) => ({
    type: ADD_PAGINATED_ID,
    id,
    search,
    filterId,
  });

  const removePaginatedId = (filterId, id, search = null) => ({
    type: REMOVE_PAGINATED_ID,
    id,
    search,
    filterId,
  });

  const resetPagination = (filterId) => ({
    type: RESET_PAGINATION,
    filterId,
  });

  const resetSearchPagination = (filterId) => ({
    type: RESET_SEARCH_PAGINATION,
    filterId,
  });

  // SELECTORS
  const selectors = isFunction(getState) ? {
    makeGetByPagination: () => createSelector(
      getState,
      (_, filterId) => filterId,
      (items, filterId) => pathOr(EMPTY_OBJECT, [filterId, BY_PAGINATION])(items),
    ),
    makeIsPaginationAlreadyFetched: () => createSelector(
      getState,
      (_, filterId, search) => ({ filterId, search }),
      (items, { filterId, search }) => !isNil(path([filterId, search ? 'search' : BY_PAGINATION])(items)),
    ),
    makeGetSearch: () => createSelector(
      getState,
      (_, filterId) => filterId,
      (items, filterId) => pathOr(null, [filterId, 'search'])(items),
    ),
    makeGetBySearchPagination: () => createSelector(
      getState,
      (_, filterId) => filterId,
      (items, filterId) => pathOr(EMPTY_OBJECT, [filterId, BY_SEARCH_PAGINATION])(items),
    ),
    makeGetItemCount: () => createSelector(
      getState,
      (_, filterId) => filterId,
      (items, filterId) => pathOr(null, [filterId, 'itemCount'])(items),
    ),
  } : {};

  // REDUCER
  const reducer = createResetOnSignOutReducer(initialState, {
    [RECEIVE_PAGINATED_ITEM_COUNT]: onReceivePaginatedItemCount,
    [RECEIVE_PAGINATED_IDS]: onReceivePaginatedIds,
    [ADD_PAGINATED_ID]: onAddPaginatedId,
    [REMOVE_PAGINATED_ID]: onRemovePaginatedId,
    [RESET_PAGINATION]: onResetPagination,
    [RESET_SEARCH_PAGINATION]: onResetSearchPagination,
  });

  return {
    actions: {
      RECEIVE_PAGINATED_ITEM_COUNT,
      RECEIVE_PAGINATED_IDS,
      ADD_PAGINATED_ID,
      REMOVE_PAGINATED_ID,
      RESET_PAGINATION,
      RESET_SEARCH_PAGINATION,
    },
    actionCreators: {
      receivePaginatedItemCount,
      receivePaginatedIds,
      addPaginatedId,
      removePaginatedId,
      resetPagination,
      resetSearchPagination,
    },
    selectors,
    reducer,
  };
};
