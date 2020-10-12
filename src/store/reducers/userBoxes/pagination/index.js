import { createSelector } from 'reselect';
import { ALL } from 'constants/app/boxes/statuses';

import { makePaginationReducer } from 'store/reducers/helpers/pagination';

import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import pluck from '@misakey/helpers/pluck';
import all from '@misakey/helpers/all';
import isNil from '@misakey/helpers/isNil';

// CONSTANTS
export const REDUCER_KEY = 'userBoxesPagination';

// HELPERS
const itemCountPluck = pluck('itemCount');
const isNilOrZero = (value) => isNil(value) || value === 0;
const allIsNilOrZero = all(isNilOrZero);
export const getUserBoxesState = () => path([REDUCER_KEY]);

// FACTORY CALLS
const {
  actions: helperActions,
  actionCreators: helperActionCreators,
  selectors: helperSelectors,
  reducer,
} = makePaginationReducer('USER_BOXES', getUserBoxesState());

export const actions = helperActions;
export const actionCreators = helperActionCreators;
export const selectors = {
  ...helperSelectors,
  isEmpty: createSelector(
    prop(REDUCER_KEY),
    (statusesPagination) => allIsNilOrZero(itemCountPluck(Object.values(statusesPagination))),
  ),
};

// THUNKS
export const moveBackUpId = (id, status = ALL) => (dispatch, getState) => {
  const { getByPagination } = selectors;
  const { addPaginatedId, removePaginatedId } = actionCreators;

  const existingItems = getByPagination(getState(), status);
  const existingItemsIds = Object.values(existingItems);

  if (!existingItemsIds.includes(id)) {
    return Promise.resolve(dispatch(addPaginatedId(status, id)));
  }

  return Promise.all([
    dispatch(removePaginatedId(status, id)),
    dispatch(addPaginatedId(status, id)),
  ]);
};

// REDUCER
export default {
  [REDUCER_KEY]: reducer,
};
