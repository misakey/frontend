import { combineReducers } from 'redux';
import { createSelector } from 'reselect';

import { OPEN, CLOSED, ALL } from 'constants/app/boxes/statuses';

import { makePaginationReducer } from 'store/reducers/helpers/pagination';

import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import pluck from '@misakey/helpers/pluck';
import compose from '@misakey/helpers/compose';
import all from '@misakey/helpers/all';
import isNil from '@misakey/helpers/isNil';

// CONSTANTS
export const REDUCER_KEY = 'userBoxesPagination';

// HELPERS
export const getState = (status) => path([REDUCER_KEY, status]);

const removePaginatedIdPluck = pluck('removePaginatedId');
const getRemovePaginatedIdActionCreators = compose(
  Object.values,
  removePaginatedIdPluck,
);
const itemCountPluck = pluck('itemCount');

const isNilOrZero = (value) => isNil(value) || value === 0;
const allIsNilOrZero = all(isNilOrZero);

// FACTORY CALLS
export const {
  actions: openActions,
  actionCreators: openActionCreators,
  selectors: openSelectors,
  reducer: openReducer,
} = makePaginationReducer(`USER_BOXES_${OPEN}`, getState(OPEN));

export const {
  actions: closedActions,
  actionCreators: closedActionCreators,
  selectors: closedSelectors,
  reducer: closedReducer,
} = makePaginationReducer(`USER_BOXES_${CLOSED}`, getState(CLOSED));

export const {
  actions: allActions,
  actionCreators: allActionCreators,
  selectors: allSelectors,
  reducer: allReducer,
} = makePaginationReducer(`USER_BOXES_${ALL}`, getState(ALL));


export const actions = {
  [ALL]: allActions,
  [OPEN]: openActions,
  [CLOSED]: closedActions,
};

export const actionCreators = {
  [ALL]: allActionCreators,
  [OPEN]: openActionCreators,
  [CLOSED]: closedActionCreators,
};

export const selectors = {
  [ALL]: allSelectors,
  [OPEN]: openSelectors,
  [CLOSED]: closedSelectors,
  isEmpty: createSelector(
    prop(REDUCER_KEY),
    (statusesPagination) => allIsNilOrZero(itemCountPluck(Object.values(statusesPagination))),
  ),
};

// THUNKS
export const updatePaginationsToStatus = (id, status) => (dispatch) => {
  const { [status]: toStatusActionCreators, ...otherStatusesActionCreators } = actionCreators;

  if (isNil(toStatusActionCreators)) {
    return Promise.reject(new Error(`Unhandled status ${status}`));
  }
  const { addPaginatedId } = toStatusActionCreators;

  const removeActionCreators = getRemovePaginatedIdActionCreators(otherStatusesActionCreators);

  return Promise.all([
    dispatch(addPaginatedId(id)),
    ...removeActionCreators.map((removePaginatedId) => dispatch(removePaginatedId(id))),
  ]);
};

export const moveBackUpId = (id, status = ALL) => (dispatch) => {
  const { [status]: toStatusActionCreators } = actionCreators;

  if (isNil(toStatusActionCreators)) {
    return Promise.reject(new Error(`Unhandled status ${status}`));
  }
  const { addPaginatedId, removePaginatedId } = toStatusActionCreators;
  return Promise.all([
    dispatch(removePaginatedId(id)),
    dispatch(addPaginatedId(id)),
  ]);
};

// REDUCER
export default {
  [REDUCER_KEY]: combineReducers({
    [ALL]: allReducer,
    [OPEN]: openReducer,
    [CLOSED]: closedReducer,
  }),
};
