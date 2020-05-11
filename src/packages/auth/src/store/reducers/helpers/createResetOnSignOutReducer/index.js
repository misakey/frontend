import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { SIGN_OUT } from '@misakey/auth/store/actions/auth';


export default function createResetOnSignOutReducer(initialState, handlers, scope) {
  const reducer = createReducer(initialState, handlers, scope);
  return function authReducer(state, action) {
    if (action.type === SIGN_OUT) {
      return initialState;
    }
    return reducer(state, action);
  };
}

export const wrapReducerWithResetOnSignOut = (initialState, extraReducers = {}, createFn) => {
  const reducer = createFn(initialState, extraReducers);
  return (state, action) => {
    if (action.type === SIGN_OUT) {
      return initialState;
    }
    return reducer(state, action);
  };
};
