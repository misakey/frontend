import { combineReducers } from 'redux';

import { useReducer } from 'react';

// HOOKS
/**
 * @returns {[state, dispatch]} reducer composed of state and dispatch
 */
export default (combinedReducers, combinedInitialState) => {
  const reducer = useReducer(
    combineReducers(combinedReducers),
    combinedInitialState,
  );

  return reducer;
};
