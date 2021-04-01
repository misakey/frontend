import { makePaginationReducer } from 'store/reducers/helpers/pagination';

import path from '@misakey/core/helpers/path';
// CONSTANTS
export const REDUCER_KEY = 'boxEventsPagination';

// HELPERS
export const getState = () => path([REDUCER_KEY]);

// FACTORY CALLS
export const {
  actions,
  actionCreators,
  selectors,
  reducer,
} = makePaginationReducer('BOX_EVENTS', getState());

// REDUCER
export default {
  [REDUCER_KEY]: reducer,
};
