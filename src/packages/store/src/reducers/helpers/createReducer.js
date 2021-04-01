import isFunction from '@misakey/core/helpers/isFunction';

function reducerShouldMatch(action, shouldMatch) {
  return !shouldMatch || action.scope === shouldMatch;
}

export default function createReducer(initialState, handlers, scope = undefined) {
  return function reducer(state = initialState, action) {
    if (reducerShouldMatch(action, scope) && isFunction(handlers[action.type])) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}
