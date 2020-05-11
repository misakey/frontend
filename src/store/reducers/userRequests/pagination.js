import { combineReducers } from 'redux';
import { createSelector } from 'reselect';

import { DRAFT, OPEN, DONE, CLOSED } from 'constants/databox/status';

import { makePaginationReducer } from 'store/reducers/helpers/pagination';

import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import pluck from '@misakey/helpers/pluck';
import compose from '@misakey/helpers/compose';
import all from '@misakey/helpers/all';
import isNil from '@misakey/helpers/isNil';

// CONSTANTS
const REDUCER_KEY = 'userRequestsPagination';

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
  actions: draftActions,
  actionCreators: draftActionCreators,
  selectors: draftSelectors,
  reducer: draftReducer,
} = makePaginationReducer(`USER_REQUESTS_${DRAFT}`, getState(DRAFT));

export const {
  actions: openActions,
  actionCreators: openActionCreators,
  selectors: openSelectors,
  reducer: openReducer,
} = makePaginationReducer(`USER_REQUESTS_${OPEN}`, getState(OPEN));

export const {
  actions: doneActions,
  actionCreators: doneActionCreators,
  selectors: doneSelectors,
  reducer: doneReducer,
} = makePaginationReducer(`USER_REQUESTS_${DONE}`, getState(DONE));

export const {
  actions: closedActions,
  actionCreators: closedActionCreators,
  selectors: closedSelectors,
  reducer: closedReducer,
} = makePaginationReducer(`USER_REQUESTS_${CLOSED}`, getState(CLOSED));

export const actions = {
  [DRAFT]: draftActions,
  [OPEN]: openActions,
  [DONE]: doneActions,
  [CLOSED]: closedActions,
};

export const actionCreators = {
  [DRAFT]: draftActionCreators,
  [OPEN]: openActionCreators,
  [DONE]: doneActionCreators,
  [CLOSED]: closedActionCreators,
};

export const selectors = {
  [DRAFT]: draftSelectors,
  [OPEN]: openSelectors,
  [DONE]: doneSelectors,
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
    throw new Error(`Unhandled status ${status}`);
  }
  const { addPaginatedId } = toStatusActionCreators;

  const removeActionCreators = getRemovePaginatedIdActionCreators(otherStatusesActionCreators);

  return Promise.all([
    dispatch(addPaginatedId(id)),
    ...removeActionCreators.map((removePaginatedId) => dispatch(removePaginatedId(id))),
  ]);
};

// REDUCER
export default {
  [REDUCER_KEY]: combineReducers({
    [DRAFT]: draftReducer,
    [OPEN]: openReducer,
    [DONE]: doneReducer,
    [CLOSED]: closedReducer,
  }),
};
