import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { SIGN_OUT, AUTH_RESET } from '@misakey/auth/store/actions/auth';


export default function createResetOnSignOutReducer(initialState, handlers, scope) {
  const reducer = createReducer(initialState, handlers, scope);
  return function authReducer(state, action) {
    const { type } = action;
    if (type === SIGN_OUT || type === AUTH_RESET) {
      return initialState;
    }
    return reducer(state, action);
  };
}

export const wrapReducerWithResetOnSignOut = (initialState, extraReducers = {}, createFn) => {
  const reducer = createFn(initialState, extraReducers);
  return (state, action) => {
    const { type } = action;
    if (type === SIGN_OUT || type === AUTH_RESET) {
      return initialState;
    }
    return reducer(state, action);
  };
};
