import { createSelector } from 'reselect';

import { makePaginationReducer } from 'store/reducers/helpers/pagination';

import path from '@misakey/core/helpers/path';
import prop from '@misakey/core/helpers/prop';
import pluck from '@misakey/core/helpers/pluck';
import all from '@misakey/core/helpers/all';
import isNil from '@misakey/core/helpers/isNil';

// CONSTANTS
export const REDUCER_KEY = 'agentsPagination';

// HELPERS
const itemCountPluck = pluck('itemCount');
const isNilOrZero = (value) => isNil(value) || value === 0;
const allIsNilOrZero = all(isNilOrZero);
export const getSubState = () => path([REDUCER_KEY]);

// FACTORY CALLS
const {
  actions: helperActions,
  actionCreators: helperActionCreators,
  selectors: helperSelectors,
  reducer,
} = makePaginationReducer('AGENTS', getSubState());

export const actions = helperActions;
export const actionCreators = helperActionCreators;
export const selectors = {
  ...helperSelectors,
  isEmpty: createSelector(
    prop(REDUCER_KEY),
    (statusesPagination) => allIsNilOrZero(itemCountPluck(Object.values(statusesPagination))),
  ),
};

// REDUCER
export default {
  [REDUCER_KEY]: reducer,
};
